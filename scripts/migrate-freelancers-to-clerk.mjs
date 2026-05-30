/**
 * AOTF → Clerk Freelancer Migration Script
 *
 * Migrates paid freelancers from the legacy MongoDB into Clerk.
 * The OLD MongoDB is read-only — this script never modifies it.
 * The NEW MongoDB is seeded automatically by the Clerk `user.created`
 * webhook when the freelancer signs in for the first time.
 *
 * Usage:
 *   node migrate-freelancers-to-clerk.mjs           ← dry run (safe, nothing created)
 *   node migrate-freelancers-to-clerk.mjs --live    ← creates Clerk users
 *
 * Prerequisites:
 *   npm install mongodb @clerk/backend dotenv
 *
 * Required env vars (place in a local .env in this folder, or in .env.local):
 *   MONGODB_URI_LEGACY=mongodb+srv://...  ← OLD production cluster
 *   CLERK_SECRET_KEY=sk_live_...          ← Clerk secret key
 *
 * What gets written to Clerk publicMetadata:
 *   {
 *     role: "teacher_candidate",
 *     onboardingCompleted: false,
 *     migratedFromLegacy: true,
 *     registrationFeeStatus: "paid",
 *     legacyPlan: "teacher_candidate",
 *     legacyTeacherId: "<freelancer id from old DB>"
 *   }
 *
 * On first sign-in the Clerk user.created webhook will:
 *   - Create a User + Profile doc in the NEW MongoDB
 *   - Seed an OnboardingDetails stub with expiresAt = null (no deletion timer)
 *   - Preserve all migration flags in Clerk publicMetadata
 *
 * The onboarding page will detect migratedFromLegacy and show "Activate Account"
 * instead of the Razorpay payment UI.
 *
 * NOTE: Freelancers map to the "teacher_candidate" plan in the new system —
 *       the closest equivalent role (candidate-access enabled, tuition-access enabled).
 */

import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { resolve, dirname } from "path";
import dns from "node:dns/promises";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env.local from the repo root (parent of /scripts)
dotenv.config({ path: resolve(__dirname, "../.env.local") });
// Fallback: also load a local .env in the scripts folder if present
dotenv.config({ path: resolve(__dirname, ".env") });

import { MongoClient } from "mongodb";
import { createClerkClient } from "@clerk/backend";
if (process.env.NODE_ENV === "production") {
  // In production, use the default DNS servers (e.g. from /etc/resolv.conf)
  // which should be able to resolve Atlas cluster hostnames.
} else {
  // In development, override DNS servers to avoid issues with certain ISPs
  // that can't resolve Atlas cluster hostnames (e.g. Comcast).
  dns.setServers(["1.1.1.1"]);
}

// ─── Validate env ──────────────────────────────────────────────────────────────

const IS_LIVE = process.argv.includes("--live");
const { MONGODB_URI_LEGACY, CLERK_SECRET_KEY } = process.env;

if (!MONGODB_URI_LEGACY)
  throw new Error(
    "Missing MONGODB_URI_LEGACY in env. This must point to the OLD production cluster."
  );
if (!CLERK_SECRET_KEY) throw new Error("Missing CLERK_SECRET_KEY in env");

// ─── Constants ─────────────────────────────────────────────────────────────────

/** Name of the legacy database on the old cluster */
const LEGACY_DB_NAME = "academy-of-tutorials-freelancers";

/** Clerk rate-limit: stay under 20 req/s — 250 ms between calls is safe */
const CLERK_RATE_LIMIT_DELAY_MS = 250;

// ─── Helpers ───────────────────────────────────────────────────────────────────

function splitName(fullName = "") {
  const parts = fullName.trim().split(/\s+/);
  return {
    firstName: parts[0] ?? "",
    lastName: parts.slice(1).join(" ") ?? "",
  };
}

function log(emoji, msg) {
  console.log(`${emoji}  ${msg}`);
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Derive a Clerk-safe username from an email address.
 * Rules enforced to satisfy the most restrictive Clerk settings:
 *   - letters only (strip digits and special chars)
 *   - lowercase
 *   - 4–32 characters
 *   - fallback to "user" if the local part has no letters at all
 * @param {string} email
 * @param {number} [suffix] — append a numeric suffix to avoid collisions
 */
function makeUsername(email, suffix = 0) {
  const local = email.split("@")[0] ?? "";
  // Keep only ASCII letters, lowercase
  let base = local.replace(/[^a-zA-Z]/g, "").toLowerCase();
  if (base.length < 4) base = (base + "user").slice(0, 32);
  base = base.slice(0, suffix > 0 ? 29 : 32); // leave room for suffix digits
  return suffix > 0 ? `${base}${suffix}` : base;
}

// ─── Main ──────────────────────────────────────────────────────────────────────

async function migrate() {
  console.log("\n╔════════════════════════════════════════════════════════════╗");
  console.log(
    `║  AOTF Freelancers → Clerk Migration  [${IS_LIVE ? "LIVE 🔴" : "DRY RUN 🟡"}]        ║`
  );
  console.log("╚════════════════════════════════════════════════════════════╝\n");

  if (!IS_LIVE) {
    console.log("ℹ️  DRY RUN — no Clerk users will be created.");
    console.log("   Verify the output, then run with --live when ready.\n");
  }

  // ── Connect to legacy MongoDB ──────────────────────────────────────────────

  const mongoClient = new MongoClient(MONGODB_URI_LEGACY);
  await mongoClient.connect();
  log("✅", `Connected to legacy MongoDB — db: "${LEGACY_DB_NAME}"`);

  const db = mongoClient.db(LEGACY_DB_NAME);
  const freelancersCol = db.collection("freelancers");

  // ── Init Clerk ─────────────────────────────────────────────────────────────

  const clerk = createClerkClient({ secretKey: CLERK_SECRET_KEY });

  // ── Fetch paid freelancers ─────────────────────────────────────────────────

  const paidFreelancers = await freelancersCol
    .find({ registrationFeeStatus: "paid" })
    .toArray();

  log("📋", `Paid freelancers found: ${paidFreelancers.length}`);

  if (paidFreelancers.length === 0) {
    log("🤷", "No paid freelancers found. Nothing to migrate.");
    await mongoClient.close();
    return;
  }

  console.log("");

  // ── Migrate ────────────────────────────────────────────────────────────────

  const results = { created: 0, skipped: 0, failed: 0 };
  const failures = [];

  for (const freelancer of paidFreelancers) {
    // Freelancers may have teacherId or a similar ID field; use _id as fallback
    const { email, name, teacherId, freelancerId } = freelancer;
    const legacyId =
      teacherId ?? freelancerId ?? freelancer._id?.toString() ?? null;

    if (!email) {
      log(
        "⚠️ ",
        `Skipping freelancer with no email (legacyId: ${legacyId ?? "unknown"})`
      );
      results.skipped++;
      continue;
    }

    const { firstName, lastName } = splitName(name ?? "");

    // ── Dry run ──────────────────────────────────────────────────────────────

    if (!IS_LIVE) {
      log(
        "🔍",
        `[DRY RUN] ${email} | "${firstName} ${lastName}" | role: teacher_candidate | legacyId: ${legacyId ?? "n/a"}`
      );
      results.created++;
      continue;
    }

    // ── Live ─────────────────────────────────────────────────────────────────

    try {
      // Idempotency: skip if this email already exists in Clerk
      const existing = await clerk.users.getUserList({
        emailAddress: [email],
      });

      if (existing.totalCount > 0) {
        log("⏭️ ", `Already in Clerk, skipping: ${email}`);
        results.skipped++;
        await sleep(CLERK_RATE_LIMIT_DELAY_MS);
        continue;
      }

      // Try to create the user; if the username collides, retry with a suffix.
      let created = false;
      for (let attempt = 0; attempt <= 9 && !created; attempt++) {
        const username = makeUsername(email, attempt);
        try {
          await clerk.users.createUser({
            emailAddress: [email],
            username,
            firstName,
            lastName,
            // No password — users sign in via Google (email auto-links) or
            // use "Forgot Password" to set a new one.
            skipPasswordChecks: true,
            skipPasswordRequirement: true,
            publicMetadata: {
              role: "teacher_candidate",
              onboardingCompleted: false,
              migratedFromLegacy: true,
              registrationFeeStatus: "paid",
              legacyPlan: "teacher_candidate",
              legacyTeacherId: legacyId,
            },
          });
          created = true;
        } catch (innerErr) {
          const isUsernameConflict =
            innerErr?.errors?.some(
              (e) => e.code === "form_identifier_exists"
            ) ?? false;
          // Only retry on username collision; re-throw everything else
          if (!isUsernameConflict || attempt === 9) throw innerErr;
        }
      }

      log(
        "✅",
        `Created: ${email} (teacher_candidate) | legacyId: ${legacyId ?? "n/a"}`
      );
      results.created++;

      // Brief pause to respect Clerk's rate limits
      await sleep(CLERK_RATE_LIMIT_DELAY_MS);
    } catch (err) {
      const reason =
        err?.errors?.[0]?.longMessage ??
        err?.errors?.[0]?.message ??
        err.message ??
        String(err);

      log("❌", `Failed: ${email} — ${reason}`);
      results.failed++;
      failures.push({ email, legacyId: legacyId ?? "unknown", error: reason });
    }
  }

  // ── Summary ────────────────────────────────────────────────────────────────

  console.log("\n╔════════════════════════════════════════════════════════════╗");
  console.log("║                         SUMMARY                           ║");
  console.log("╚════════════════════════════════════════════════════════════╝");
  console.log(
    `  ✅  ${IS_LIVE ? "Created     " : "Would create"} : ${results.created}`
  );
  console.log(`  ⏭️   Skipped      : ${results.skipped}`);
  console.log(`  ❌  Failed       : ${results.failed}`);

  if (failures.length > 0) {
    console.log("\n── Failures ──────────────────────────────────────────────────");
    for (const f of failures) {
      console.log(
        `  • [teacher_candidate] ${f.email} (legacyId: ${f.legacyId})`
      );
      console.log(`    └─ ${f.error}`);
    }
  }

  if (!IS_LIVE) {
    console.log(
      "\n💡 Happy with the output? Run the live migration:\n   node migrate-freelancers-to-clerk.mjs --live\n"
    );
  } else {
    console.log("\n🎉 Freelancer migration complete.\n");
  }

  await mongoClient.close();
}

migrate().catch((err) => {
  console.error("\n💥 Fatal error:", err);
  process.exit(1);
});

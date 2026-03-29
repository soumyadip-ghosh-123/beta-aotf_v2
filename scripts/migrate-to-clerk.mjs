/**
 * AOTF → Clerk Migration Script
 *
 * Migrates paid teachers and freelancers from MongoDB into Clerk.
 * MongoDB is never modified — this is a read-only operation on your DB.
 *
 * Usage:
 *   node migrate-to-clerk.mjs           ← dry run (safe, nothing created)
 *   node migrate-to-clerk.mjs --live    ← actually creates Clerk users
 *
 * Prerequisites:
 *   npm install mongodb @clerk/backend dotenv
 *
 * .env file (place in the same folder as this script):
 *   MONGODB_URI=mongodb+srv://...
 *   CLERK_SECRET_KEY=sk_live_...
 */

import "dotenv/config";
import { MongoClient } from "mongodb";
import { createClerkClient } from "@clerk/backend";

// ─── Validate env ─────────────────────────────────────────────────────────────

const IS_LIVE = process.argv.includes("--live");
const { MONGODB_URI, CLERK_SECRET_KEY } = process.env;

if (!MONGODB_URI) throw new Error("Missing MONGODB_URI in .env");
if (!CLERK_SECRET_KEY) throw new Error("Missing CLERK_SECRET_KEY in .env");

// ─── Constants ────────────────────────────────────────────────────────────────

const DB_NAME = "academy-of-tutorials-freelancers";
const CLERK_RATE_LIMIT_DELAY_MS = 250; // stay safe under Clerk's rate limit

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

// ─── Main ─────────────────────────────────────────────────────────────────────

async function migrate() {
  console.log("\n╔════════════════════════════════════════════════╗");
  console.log(`║  AOTF → Clerk Migration  [${IS_LIVE ? "LIVE 🔴" : "DRY RUN 🟡"}]          ║`);
  console.log("╚════════════════════════════════════════════════╝\n");

  if (!IS_LIVE) {
    console.log("ℹ️  DRY RUN — no users will be created in Clerk.");
    console.log("   Verify the output, then run with --live when ready.\n");
  }

  // ── Connect to MongoDB ──────────────────────────────────────────────────────

  const mongoClient = new MongoClient(MONGODB_URI);
  await mongoClient.connect();
  log("✅", `Connected to MongoDB — db: "${DB_NAME}"`);

  const db = mongoClient.db(DB_NAME);
  const usersCol       = db.collection("users");
  const teachersCol    = db.collection("teachers");
  const freelancersCol = db.collection("freelancers");

  // ── Init Clerk ──────────────────────────────────────────────────────────────

  const clerk = createClerkClient({ secretKey: CLERK_SECRET_KEY });

  // ── Fetch paid records ──────────────────────────────────────────────────────

  const [paidTeachers, paidFreelancers] = await Promise.all([
    teachersCol.find({ registrationFeeStatus: "paid" }).toArray(),
    freelancersCol.find({ registrationFeeStatus: "paid" }).toArray(),
  ]);

  log("📋", `Paid teachers   : ${paidTeachers.length}`);
  log("📋", `Paid freelancers: ${paidFreelancers.length}`);

  const allCandidates = [
    ...paidTeachers.map((t) => ({ ...t, _role: "teacher" })),
    ...paidFreelancers.map((f) => ({ ...f, _role: "freelancer" })),
  ];

  if (allCandidates.length === 0) {
    log("🤷", "No paid users found. Nothing to migrate.");
    await mongoClient.close();
    return;
  }

  // ── Build email → name lookup from users collection ─────────────────────────
  // users collection holds the canonical name entered at registration

  const emails = [...new Set(allCandidates.map((c) => c.email).filter(Boolean))];

  const usersInDb = await usersCol
    .find({ email: { $in: emails } }, { projection: { email: 1, name: 1 } })
    .toArray();

  const nameByEmail = {};
  for (const u of usersInDb) {
    nameByEmail[u.email] = u.name ?? "";
  }

  log(
    "🗺️ ",
    `Matched ${Object.keys(nameByEmail).length}/${emails.length} emails in users collection`
  );
  console.log("");

  // ── Migrate ─────────────────────────────────────────────────────────────────

  const results = { created: 0, skipped: 0, failed: 0 };
  const failures = [];

  for (const candidate of allCandidates) {
    const { email, name, _role } = candidate;

    if (!email) {
      log("⚠️ ", `Skipping record with no email (_id: ${candidate._id})`);
      results.skipped++;
      continue;
    }

    // Prefer name from users collection; fall back to name on the profile doc
    const resolvedName = nameByEmail[email] || name || "";
    const { firstName, lastName } = splitName(resolvedName);

    // ── Dry run ──────────────────────────────────────────────────────────────

    if (!IS_LIVE) {
      log(
        "🔍",
        `[DRY RUN] ${email} | "${firstName} ${lastName}" | role: ${_role}`
      );
      results.created++;
      continue;
    }

    // ── Live ─────────────────────────────────────────────────────────────────

    try {
      // Idempotency: skip if this email already exists in Clerk
      const existing = await clerk.users.getUserList({ emailAddress: [email] });

      if (existing.totalCount > 0) {
        log("⏭️ ", `Already in Clerk, skipping: ${email}`);
        results.skipped++;
        continue;
      }

      await clerk.users.createUser({
        emailAddress: [email],
        firstName,
        lastName,
        // No password — users sign in via Google (email match auto-links)
        // or use "Forgot password" to set a new one.
        skipPasswordChecks: true,
        skipPasswordRequirement: true,
        publicMetadata: {
          role: _role,
          onboardingCompleted: false, // they re-complete onboarding on new system
          migratedFromLegacy: true,   // use this to show a "welcome back" banner
        },
      });

      log("✅", `Created: ${email} (${_role})`);
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
      failures.push({ email, role: _role, error: reason });
    }
  }

  // ── Summary ───────────────────────────────────────────────────────────────

  console.log("\n╔════════════════════════════════════════════════╗");
  console.log("║                   SUMMARY                     ║");
  console.log("╚════════════════════════════════════════════════╝");
  console.log(`  ✅  ${IS_LIVE ? "Created     " : "Would create"} : ${results.created}`);
  console.log(`  ⏭️   Skipped      : ${results.skipped}`);
  console.log(`  ❌  Failed       : ${results.failed}`);

  if (failures.length > 0) {
    console.log("\n── Failures ─────────────────────────────────────");
    for (const f of failures) {
      console.log(`  • [${f.role}] ${f.email}`);
      console.log(`    └─ ${f.error}`);
    }
  }

  if (!IS_LIVE) {
    console.log(
      "\n💡 Happy with the output? Run the live migration:\n   node migrate-to-clerk.mjs --live\n"
    );
  } else {
    console.log("\n🎉 Migration complete.\n");
  }

  await mongoClient.close();
}

migrate().catch((err) => {
  console.error("\n💥 Fatal error:", err);
  process.exit(1);
});

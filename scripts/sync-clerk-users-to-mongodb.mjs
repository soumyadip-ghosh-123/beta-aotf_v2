/**
 * Backfill NEW MongoDB User + Profile records from existing Clerk accounts.
 *
 * Use this after migrate-teachers-to-clerk.mjs (or migrate-freelancers-to-clerk.mjs)
 * when users exist in Clerk but do not appear in /admin/users — that page reads
 * from MongoDB, not Clerk directly.
 *
 * Usage:
 *   node scripts/sync-clerk-users-to-mongodb.mjs           ← dry run
 *   node scripts/sync-clerk-users-to-mongodb.mjs --live    ← write to MongoDB
 *
 * Required env vars (.env.local):
 *   MONGODB_URI=...
 *   CLERK_SECRET_KEY=...
 */

import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { resolve, dirname } from "path";
import dns from "node:dns/promises";
import { MongoClient } from "mongodb";
import { createClerkClient } from "@clerk/backend";
import { seedClerkUserInMongo } from "./lib/seed-clerk-user.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, "../.env.local") });
dotenv.config({ path: resolve(__dirname, ".env") });

// Match lib/db.ts: only override DNS in production builds.
if (process.env.NODE_ENV === "production") {
  dns.setServers(["1.1.1.1", "8.8.8.8"]);
}

const IS_LIVE = process.argv.includes("--live");
const { MONGODB_URI, CLERK_SECRET_KEY } = process.env;

if (!MONGODB_URI) throw new Error("Missing MONGODB_URI in env");
if (!CLERK_SECRET_KEY) throw new Error("Missing CLERK_SECRET_KEY in env");

const CLERK_PAGE_SIZE = 100;
const CLERK_RATE_LIMIT_DELAY_MS = 150;

function log(emoji, msg) {
  console.log(`${emoji}  ${msg}`);
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function isAppUser(clerkUser) {
  const metadata = clerkUser.publicMetadata ?? {};
  if (metadata.isAdmin === true) return false;

  const role = metadata.role;
  const legacyPlan = metadata.legacyPlan;
  return (
    role === "teacher" ||
    role === "teacher_candidate" ||
    legacyPlan === "teacher" ||
    legacyPlan === "teacher_candidate" ||
    metadata.migratedFromLegacy === true
  );
}

async function listAllClerkUsers(clerk) {
  const all = [];
  let offset = 0;

  while (true) {
    const page = await clerk.users.getUserList({
      limit: CLERK_PAGE_SIZE,
      offset,
      orderBy: "-created_at",
    });

    all.push(...page.data);
    if (page.data.length < CLERK_PAGE_SIZE) break;
    offset += CLERK_PAGE_SIZE;
    await sleep(CLERK_RATE_LIMIT_DELAY_MS);
  }

  return all;
}

async function main() {
  console.log("\n╔════════════════════════════════════════════════════════╗");
  console.log(
    `║  Clerk → MongoDB User Sync  [${IS_LIVE ? "LIVE 🔴" : "DRY RUN 🟡"}]       ║`,
  );
  console.log("╚════════════════════════════════════════════════════════╝\n");

  if (!IS_LIVE) {
    console.log("ℹ️  DRY RUN — no MongoDB writes. Pass --live to apply.\n");
  }

  const clerk = createClerkClient({ secretKey: CLERK_SECRET_KEY });
  const mongoClient = new MongoClient(MONGODB_URI);
  await mongoClient.connect();
  const db = mongoClient.db();

  log("✅", "Connected to MongoDB and Clerk");

  const clerkUsers = await listAllClerkUsers(clerk);
  const appUsers = clerkUsers.filter(isAppUser);

  log("📋", `Clerk users total: ${clerkUsers.length}`);
  log("📋", `App users to sync: ${appUsers.length}`);
  console.log("");

  const results = { created: 0, updated: 0, skipped: 0, failed: 0 };
  const failures = [];

  for (const clerkUser of appUsers) {
    const email =
      clerkUser.emailAddresses?.find(
        (e) => e.id === clerkUser.primaryEmailAddressId,
      )?.emailAddress ?? clerkUser.emailAddresses?.[0]?.emailAddress;

    try {
      if (!IS_LIVE) {
        const existing = await db.collection("users").findOne({
          clerkId: clerkUser.id,
        });
        log(
          "🔍",
          `[DRY RUN] ${email ?? clerkUser.id} — would ${existing ? "update" : "create"} MongoDB record`,
        );
        if (existing) results.updated++;
        else results.created++;
        continue;
      }

      const { action, reason } = await seedClerkUserInMongo(db, clerkUser);
      if (action === "skipped") {
        results.skipped++;
        log("⏭️ ", `Skipped ${email ?? clerkUser.id}: ${reason}`);
      } else if (action === "created") {
        results.created++;
        log("✅", `Created MongoDB record: ${email ?? clerkUser.id}`);
      } else {
        results.updated++;
        log("🔄", `Updated MongoDB record: ${email ?? clerkUser.id}`);
      }
    } catch (err) {
      results.failed++;
      const reason = err?.message ?? String(err);
      failures.push({ email: email ?? clerkUser.id, error: reason });
      log("❌", `Failed ${email ?? clerkUser.id}: ${reason}`);
    }
  }

  console.log("\n╔════════════════════════════════════════════════════════╗");
  console.log("║                       SUMMARY                         ║");
  console.log("╚════════════════════════════════════════════════════════╝");
  console.log(
    `  ✅  ${IS_LIVE ? "Created     " : "Would create"} : ${results.created}`,
  );
  console.log(
    `  🔄  ${IS_LIVE ? "Updated     " : "Would update"} : ${results.updated}`,
  );
  console.log(`  ⏭️   Skipped      : ${results.skipped}`);
  console.log(`  ❌  Failed       : ${results.failed}`);

  if (failures.length > 0) {
    console.log("\n── Failures ──────────────────────────────────────────────");
    for (const f of failures) {
      console.log(`  • ${f.email}`);
      console.log(`    └─ ${f.error}`);
    }
  }

  if (!IS_LIVE) {
    console.log(
      "\n💡 Run with --live to write records:\n   node scripts/sync-clerk-users-to-mongodb.mjs --live\n",
    );
  } else {
    console.log("\n🎉 Sync complete. Refresh /admin/users to see all teachers.\n");
  }

  await mongoClient.close();
}

main().catch((err) => {
  console.error("\n💥 Fatal error:", err);
  process.exit(1);
});

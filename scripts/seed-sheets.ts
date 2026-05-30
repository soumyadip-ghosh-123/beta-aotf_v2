/**
 * scripts/seed-sheets.ts
 *
 * One-shot script that bulk-populates all 3 Google Sheet tabs
 * (Tuitions, Admins, Enquiries) from existing MongoDB data.
 *
 * Usage:
 *   npx tsx scripts/seed-sheets.ts                  ← all tabs
 *   npx tsx scripts/seed-sheets.ts --tab tuitions   ← only Tuitions
 *   npx tsx scripts/seed-sheets.ts --tab enquiries  ← only Enquiries
 *
 * Prerequisites: MONGODB_URI must be set in .env.local
 */

import path from "path";
import { config } from "dotenv";

// ── Load .env.local BEFORE any lib imports ──────────────────────────────────
config({ path: path.resolve(process.cwd(), ".env.local") });

import mongoose from "mongoose";
import dns from "node:dns/promises";

// DNS override for dev (mirrors lib/db.ts behaviour)
dns.setServers(["1.1.1.1"]);

// ─── CLI args ─────────────────────────────────────────────────────────────────

const tabArgIdx = process.argv.indexOf("--tab");
const tabArg = tabArgIdx !== -1 ? process.argv[tabArgIdx + 1] : "all";

const seedTuitions = tabArg === "all" || tabArg === "tuitions";
const seedEnquiries = tabArg === "all" || tabArg === "enquiries";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sleep(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

function progress(label: string, current: number, total: number) {
  const pct = Math.round((current / total) * 100);
  process.stdout.write(`\r  [${label}] ${current}/${total} (${pct}%)`);
}

// ─── Seeds ────────────────────────────────────────────────────────────────────

async function seedTuitionsTab() {
  console.log("\n📋 Seeding Tuitions tab...");

  const { default: Post } = await import("../lib/models/Post.js");
  const { upsertPostLedger } = await import("../lib/services/postLedger.service.js");

  const posts = await Post.find({}).select("postId").lean<{ postId: string }[]>();
  console.log(`  Found ${posts.length} posts`);

  let ok = 0;
  let failed = 0;

  for (let i = 0; i < posts.length; i++) {
    const { postId } = posts[i];
    progress("Tuitions", i + 1, posts.length);
    try {
      await upsertPostLedger(postId);
      ok++;
    } catch (err) {
      console.error(`\n  ❌ Failed for postId=${postId}:`, err);
      failed++;
    }
    // ~1 write/sec to stay within Sheets API quota (60 writes/min per user)
    await sleep(1100);
  }

  console.log(`\n  ✅ Tuitions: ${ok} seeded, ${failed} failed`);
}

async function seedEnquiriesTab() {
  console.log("\n📨 Seeding Enquiries tab...");

  const { default: Enquiry } = await import("../lib/models/Enquiry.js");
  const { upsertEnquiryLedger } = await import("../lib/services/enquiryLedger.service.js");

  const enquiries = await Enquiry.find({})
    .select("enquiryId")
    .lean<{ enquiryId: string }[]>();
  console.log(`  Found ${enquiries.length} enquiries`);

  let ok = 0;
  let failed = 0;

  for (let i = 0; i < enquiries.length; i++) {
    const { enquiryId } = enquiries[i];
    progress("Enquiries", i + 1, enquiries.length);
    try {
      await upsertEnquiryLedger(enquiryId);
      ok++;
    } catch (err) {
      console.error(`\n  ❌ Failed for enquiryId=${enquiryId}:`, err);
      failed++;
    }
    await sleep(1100);
  }

  console.log(`\n  ✅ Enquiries: ${ok} seeded, ${failed} failed`);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🚀 AOTF Google Sheets Seed Script");
  console.log(`   Tab(s): ${tabArg}`);

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error("❌  MONGODB_URI not set — make sure .env.local is present.");
    process.exit(1);
  }

  console.log("   Connecting to MongoDB...");
  await mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 15_000,
    connectTimeoutMS: 15_000,
  });
  console.log("   ✅ Connected");

  if (seedTuitions) await seedTuitionsTab();
  if (seedEnquiries) await seedEnquiriesTab();

  console.log("\n🎉 Seeding complete!\n");
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("\n❌ Seed script failed:", err);
  process.exitCode = 1;
});

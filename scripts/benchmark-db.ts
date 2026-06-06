/**
 * AOTF Database Query Benchmark Script
 *
 * Connects to MongoDB Atlas and times representative queries on every collection.
 * Runs each query TWICE to differentiate cold-start vs warm (cached) performance.
 *
 * Usage:
 *   pnpm tsx scripts/benchmark-db.ts
 *
 * Requires: MONGODB_URI in .env.local (auto-loaded)
 *
 * Output: Prints a table + writes scripts/benchmark-db-results.json
 */

import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env.local") });

const OUTPUT = path.join(__dirname, "benchmark-db-results.json");

// ─── Types ────────────────────────────────────────────────────────────────────

interface QueryBenchmark {
  collection: string;
  operation: string;
  coldMs: number;
  warmMs: number;
  delta: number; // warm - cold (negative = warm is faster, expected)
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function timeQuery<T>(fn: () => Promise<T>): Promise<{ result: T; ms: number }> {
  const start = performance.now();
  const result = await fn();
  const ms = Math.round(performance.now() - start);
  return { result, ms };
}

function pad(str: string, len: number): string {
  return str.padEnd(len, " ");
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("\n🗄  AOTF MongoDB Query Benchmark");
  console.log(`   URI: ${process.env.MONGODB_URI?.slice(0, 40)}…\n`);

  const mongoose = await import("mongoose");
  const { default: dbConnect } = await import("../lib/db.js");

  // ── Cold start ──
  console.log("⏳ Cold start connect…");
  const connectStart = performance.now();
  await dbConnect();
  const connectMs = Math.round(performance.now() - connectStart);
  console.log(`   Connected in ${connectMs}ms\n`);

  // ── Import models ──
  const { default: User } = await import("../lib/models/User.js");
  const { default: Profile } = await import("../lib/models/Profile.js");
  const { default: Application } = await import("../lib/models/Application.js");
  const { default: Admin } = await import("../lib/models/Admin.js");
  const { default: Enquiry } = await import("../lib/models/Enquiry.js");
  const { default: Job } = await import("../lib/models/Job.js");
  const { default: Post } = await import("../lib/models/Post.js");
  const { default: Invoice } = await import("../lib/models/Invoice.js");
  const { default: CalendarEvent } = await import("../lib/models/CalendarEvent.js");
  const { default: PostLedger } = await import("../lib/models/PostLedger.js");

  // ── Query definitions: [collection label, operation label, query fn] ──
  type QueryDef = [string, string, () => Promise<unknown>];

  const queries: QueryDef[] = [
    ["users", "findOne (clerkId)", () => User.findOne({ clerkId: { $exists: true } }).lean()],
    ["users", "countDocuments", () => User.countDocuments()],
    ["users", "find active (limit 10)", () => User.find({ status: "active" }).limit(10).lean()],

    ["profiles", "findOne (username)", () => Profile.findOne({ username: { $exists: true } }).lean()],
    ["profiles", "find public (limit 10)", () => Profile.find({ isPublic: true }).limit(10).lean()],

    ["applications", "find by status (limit 10)", () => Application.find({ status: "applied" }).limit(10).lean()],
    ["applications", "countDocuments", () => Application.countDocuments()],
    ["applications", "find by applicantId", () => Application.find({ applicantId: { $exists: true } }).limit(5).lean()],

    ["admins", "findOne active", () => Admin.findOne({ isActive: true }).lean()],
    ["admins", "find all", () => Admin.find().lean()],

    ["enquiries", "find new (limit 10)", () => Enquiry.find({ currentStatus: "new" }).limit(10).lean()],
    ["enquiries", "countDocuments", () => Enquiry.countDocuments()],

    ["jobs", "find open (limit 10)", () => Job.find({ status: "open" }).limit(10).lean()],
    ["jobs", "countDocuments", () => Job.countDocuments()],

    ["posts", "find open (limit 10)", () => Post.find({ status: "open" }).limit(10).lean()],
    ["posts", "countDocuments", () => Post.countDocuments()],

    ["invoices", "find latest (limit 10)", () => Invoice.find({ isLatest: true }).sort({ createdAt: -1 }).limit(10).lean()],

    ["calendar_events", "find by date range", () =>
      CalendarEvent.find({
        startAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        endAt: { $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
      }).limit(50).lean()
    ],

    ["post_ledgers", "find open (limit 10)", () => PostLedger.find({ postStatus: "open" }).limit(10).lean()],
    ["post_ledgers", "aggregate (group by status)", () =>
      PostLedger.aggregate([{ $group: { _id: "$postStatus", count: { $sum: 1 } } }])
    ],
  ];

  const results: QueryBenchmark[] = [];

  for (const [collection, operation, queryFn] of queries) {
    process.stdout.write(`  ${collection} / ${operation}…`);

    // Cold run (first call after connect — may trigger index warm-up)
    const { ms: coldMs } = await timeQuery(queryFn);

    // Warm run (connection + query plan cached)
    const { ms: warmMs } = await timeQuery(queryFn);

    const delta = warmMs - coldMs;
    results.push({ collection, operation, coldMs, warmMs, delta });

    console.log(` cold=${coldMs}ms  warm=${warmMs}ms`);
  }

  // ── Print table ──
  console.log("\n");
  const COL = [20, 35, 10, 10, 12];
  const header = [
    pad("Collection", COL[0]!),
    pad("Operation", COL[1]!),
    pad("Cold (ms)", COL[2]!),
    pad("Warm (ms)", COL[3]!),
    pad("Δ (ms)", COL[4]!),
  ].join("│");
  const divider = COL.map((c) => "─".repeat(c)).join("┼");
  console.log(`┌${divider.replace(/┼/g, "┬")}┐`);
  console.log(`│${header}│`);
  console.log(`├${divider}┤`);
  for (const r of results) {
    const deltaStr = r.delta < 0 ? `${r.delta}` : `+${r.delta}`;
    const row = [
      pad(r.collection.slice(0, COL[0]! - 1), COL[0]!),
      pad(r.operation.slice(0, COL[1]! - 1), COL[1]!),
      pad(`${r.coldMs}`, COL[2]!),
      pad(`${r.warmMs}`, COL[3]!),
      pad(deltaStr, COL[4]!),
    ].join("│");
    console.log(`│${row}│`);
  }
  console.log(`└${divider.replace(/┼/g, "┴")}┘`);

  const avgCold = Math.round(results.reduce((s, r) => s + r.coldMs, 0) / results.length);
  const avgWarm = Math.round(results.reduce((s, r) => s + r.warmMs, 0) / results.length);
  console.log(`\n   DB connect: ${connectMs}ms`);
  console.log(`   Avg cold query: ${avgCold}ms  |  Avg warm query: ${avgWarm}ms`);
  console.log(`   Warm queries are ~${Math.round((1 - avgWarm / avgCold) * 100)}% faster than cold\n`);

  // ── Write JSON ──
  const output = {
    timestamp: new Date().toISOString(),
    mongodbUri: process.env.MONGODB_URI?.slice(0, 40) + "…",
    connectMs,
    avgColdMs: avgCold,
    avgWarmMs: avgWarm,
    results,
  };
  await fs.writeFile(OUTPUT, JSON.stringify(output, null, 2), "utf8");
  console.log(`📄 Results written to: ${OUTPUT}\n`);

  await mongoose.default.connection.close();
}

main().catch((err) => {
  console.error("DB benchmark failed:", err);
  process.exit(1);
});

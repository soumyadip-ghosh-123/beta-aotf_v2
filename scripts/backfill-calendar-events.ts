/**
 * scripts/backfill-calendar-events.ts
 *
 * One-time backfill: reads all source collections in batches and upserts
 * each record into `calendar_events` via CalendarEventService.
 *
 * Idempotent — safe to re-run at any time.
 *
 * Usage:
 *   npx tsx scripts/backfill-calendar-events.ts
 *
 * Prerequisites: MONGODB_URI must be set in .env.local
 */

import path from "path";
import { config } from "dotenv";

// Load .env.local
config({ path: path.resolve(process.cwd(), ".env.local") });

import mongoose from "mongoose";

// Force DNS override for dev (mirrors lib/db.ts)
import dns from "node:dns/promises";
dns.setServers(["1.1.1.1"]);

// ─── Config ───────────────────────────────────────────────────────────────────

const BATCH_SIZE = 100;

async function main() {
  // ─── Imports ──────────────────────────────────────────────────────────────

  const { default: Application } = await import("../lib/models/Application.js");
  const { default: Enquiry } = await import("../lib/models/Enquiry.js");
  const { default: Feedback } = await import("../lib/models/Feedback.js");
  const { default: TodoEvent } = await import("../lib/models/TodoEvent.js");
  const {
    upsertCalendarEvent,
    mapApplication,
    mapEnquiry,
    mapFeedback,
    mapTodo,
  } = await import("../lib/services/calendar-event.service.js");

  async function processBatch(
    docs: any[],
    mapper: (doc: any) => ReturnType<typeof mapApplication> | ReturnType<typeof mapEnquiry>,
  ): Promise<number> {
    let synced = 0;
    for (const doc of docs) {
      const input = mapper(doc);
      if (!input) continue;
      await upsertCalendarEvent(input);
      synced++;
    }
    return synced;
  }

  async function backfillApplications(): Promise<number> {
    console.log("📚  Backfilling Applications…");
    let total = 0;
    let skip = 0;

    while (true) {
      const batch = (await Application.find({})
        .skip(skip)
        .limit(BATCH_SIZE)
        .lean()) as any[];

      if (batch.length === 0) break;

      const synced = await processBatch(batch, mapApplication);
      total += synced;
      skip += batch.length;
      process.stdout.write(`\r  → ${total} synced`);
    }

    console.log(`\r  ✓ Applications: ${total} synced`);
    return total;
  }

  async function backfillEnquiries(): Promise<number> {
    console.log("📋  Backfilling Enquiries…");
    let total = 0;
    let skip = 0;

    while (true) {
      const batch = (await Enquiry.find({})
        .skip(skip)
        .limit(BATCH_SIZE)
        .lean()) as any[];

      if (batch.length === 0) break;

      const synced = await processBatch(batch, mapEnquiry);
      total += synced;
      skip += batch.length;
      process.stdout.write(`\r  → ${total} synced`);
    }

    console.log(`\r  ✓ Enquiries: ${total} synced`);
    return total;
  }

  async function backfillFeedbacks(): Promise<number> {
    console.log("💬  Backfilling Feedbacks…");
    let total = 0;
    let skip = 0;

    while (true) {
      const batch = (await Feedback.find({})
        .skip(skip)
        .limit(BATCH_SIZE)
        .lean()) as any[];

      if (batch.length === 0) break;

      const synced = await processBatch(batch, mapFeedback);
      total += synced;
      skip += batch.length;
      process.stdout.write(`\r  → ${total} synced`);
    }

    console.log(`\r  ✓ Feedbacks: ${total} synced`);
    return total;
  }

  async function backfillTodos(): Promise<number> {
    console.log("✅  Backfilling TodoEvents…");
    let total = 0;
    let skip = 0;

    while (true) {
      const batch = (await TodoEvent.find({})
        .skip(skip)
        .limit(BATCH_SIZE)
        .lean()) as any[];

      if (batch.length === 0) break;

      const synced = await processBatch(batch, mapTodo);
      total += synced;
      skip += batch.length;
      process.stdout.write(`\r  → ${total} synced`);
    }

    console.log(`\r  ✓ TodoEvents: ${total} synced`);
    return total;
  }

  const start = Date.now();
  console.log("─── Calendar Events Backfill ───────────────────────────────\n");

  try {
    const mongodbUri = process.env.MONGODB_URI;
    if (!mongodbUri) {
      console.error("❌  MONGODB_URI not set. Make sure .env.local is present.");
      process.exit(1);
    }

    console.log("⏳  Connecting to MongoDB…");
    await mongoose.connect(mongodbUri, {
      serverSelectionTimeoutMS: 15_000,
      connectTimeoutMS: 15_000,
    });
    console.log("✅  Connected.\n");

    const apps = await backfillApplications();
    const enqs = await backfillEnquiries();
    const fbs = await backfillFeedbacks();
    const todos = await backfillTodos();

    const elapsed = ((Date.now() - start) / 1000).toFixed(1);
    console.log(`
─────────────────────────────────────────────────────────
✅  Backfill complete in ${elapsed}s

  Applications : ${apps}
  Enquiries    : ${enqs}
  Feedbacks    : ${fbs}
  TodoEvents   : ${todos}
  ─────────────
  Total        : ${apps + enqs + fbs + todos}
─────────────────────────────────────────────────────────

Next steps:
  1. Compare counts to source collections in MongoDB Compass.
  2. Verify a sample of calendar_events match titles, dates, colours.
  3. Once parity is confirmed, remove the legacy path from:
       app/api/admin/calendar-events/route.ts
`);
  } catch (err) {
    console.error("\n❌  Backfill failed:", err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

void main();

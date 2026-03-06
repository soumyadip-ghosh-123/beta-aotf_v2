/**
 * Initialise the `users` collection in MongoDB.
 *
 * Run:
 *   node --env-file=.env.local scripts/init-users.mjs
 */

import mongoose, { Schema } from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("MONGODB_URI is not set. Pass it via --env-file=.env.local");
  process.exit(1);
}

// ── Schema (mirrors lib/models/User.ts) ──────────────────────────────────────

const planSchema = new Schema(
  {
    current: {
      type: String,
      enum: ["teacher", "teacher_candidate"],
      default: "teacher",
      required: true,
    },
    hasTuitionAccess: { type: Boolean, default: true },
    hasCandidateAccess: { type: Boolean, default: false },
    activatedAt: { type: Date, default: null },
  },
  { _id: false },
);

const userSchema = new Schema(
  {
    clerkId: { type: String, required: true, unique: true, index: true },
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ["teacher", "teacher_candidate", "admin"],
      default: "teacher",
      required: true,
    },
    plan: { type: planSchema, default: () => ({}) },
    onboardingCompleted: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["active", "blocked", "deleted"],
      default: "active",
      index: true,
    },
    registrationPaymentId: {
      type: Schema.Types.ObjectId,
      ref: "Payment",
      default: null,
    },
  },
  { timestamps: true },
);

// Case-insensitive unique index on username
userSchema.index(
  { username: 1 },
  { unique: true, collation: { locale: "en_US", strength: 2 } },
);

const User = mongoose.model("User", userSchema);

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("Connecting to MongoDB…");
  await mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 15_000,
    connectTimeoutMS: 15_000,
  });
  console.log(`Connected to: ${mongoose.connection.db.databaseName}`);

  console.log("Syncing indexes on `users` collection…");
  await User.syncIndexes();

  const indexes = await User.listIndexes();
  console.log(`Done. Indexes on \`users\` (${indexes.length} total):`);
  for (const idx of indexes) {
    console.log(`  • ${JSON.stringify(idx.key)}  name="${idx.name}"`);
  }
}

main()
  .catch((err) => {
    console.error("Initialisation failed:", err.message);
    process.exit(1);
  })
  .finally(() => mongoose.disconnect());

import mongoose, { Schema, type InferSchemaType } from "mongoose";

const planSchema = new Schema(
  {
    current: {
      type: String,
      enum: ["teacher", "teacher_candidate"],
      default: "teacher",
      required: true,
    },
    hasTuitionAccess: { type: Boolean, default: false },
    hasCandidateAccess: { type: Boolean, default: false },
    activatedAt: { type: Date, default: null },
  },
  { _id: false },
);

const userSchema = new Schema(
  {
    clerkId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
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
    // Tracks when the 5-day warning email was sent (null = not yet sent).
    deletionWarningEmailSentAt: { type: Date, default: null },
  },
  { timestamps: true },
);

// Case-insensitive unique username index.
userSchema.index(
  { username: 1 },
  { unique: true, collation: { locale: "en_US", strength: 2 } },
);

export type IUser = InferSchemaType<typeof userSchema> & {
  _id: mongoose.Types.ObjectId;
};

const User =
  (mongoose.models.User as mongoose.Model<IUser>) ??
  mongoose.model<IUser>("User", userSchema);

export default User;

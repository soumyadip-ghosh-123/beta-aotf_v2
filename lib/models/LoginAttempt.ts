import mongoose, { Schema, type InferSchemaType } from "mongoose";

const loginAttemptSchema = new Schema(
  {
    clerkId: {
      type: String,
      required: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    success: {
      type: Boolean,
      required: true,
    },
    ipAddress: {
      type: String,
      default: null,
    },
    userAgent: {
      type: String,
      default: null,
    },
    failureReason: {
      type: String,
      default: null,
    },
  },
  { timestamps: true },
);

// Indexes
loginAttemptSchema.index({ clerkId: 1, success: 1, createdAt: -1 });
loginAttemptSchema.index({ email: 1, createdAt: -1 });
loginAttemptSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 }); // Auto-delete after 30 days

export type ILoginAttempt = InferSchemaType<typeof loginAttemptSchema> & {
  _id: mongoose.Types.ObjectId;
};

const LoginAttempt =
  (mongoose.models.LoginAttempt as mongoose.Model<ILoginAttempt>) ??
  mongoose.model<ILoginAttempt>("LoginAttempt", loginAttemptSchema);

export default LoginAttempt;

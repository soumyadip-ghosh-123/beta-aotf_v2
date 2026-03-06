import mongoose, { Schema, type InferSchemaType } from "mongoose";

const paymentSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    clerkId: { type: String, required: true },
    purpose: {
      type: String,
      enum: ["registration", "plan_upgrade", "admin_grant", "refund"],
      required: true,
    },
    fromPlan: {
      type: String,
      enum: ["teacher", "teacher_candidate"],
      default: null,
    },
    toPlan: {
      type: String,
      enum: ["teacher", "teacher_candidate"],
      required: true,
    },
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    provider: { type: String, default: "razorpay" },
    providerOrderId: { type: String, required: true },
    providerPaymentId: { type: String, default: null },
    status: {
      type: String,
      enum: ["created", "paid", "failed", "refunded"],
      default: "created",
    },
    paidAt: { type: Date, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

paymentSchema.index(
  { userId: 1, createdAt: -1, status: 1 },
  { name: "payments_ix_1" },
);

export type IPayment = InferSchemaType<typeof paymentSchema> & {
  _id: mongoose.Types.ObjectId;
};

const Payment =
  (mongoose.models.Payment as mongoose.Model<IPayment>) ??
  mongoose.model<IPayment>("Payment", paymentSchema);

export default Payment;

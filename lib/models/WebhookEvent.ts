import mongoose, { Schema, type InferSchemaType } from "mongoose";

const webhookEventSchema = new Schema(
  {
    provider: {
      type: String,
      enum: ["razorpay", "clerk"],
      required: true,
    },
    event: { type: String, required: true },
    entityId: { type: String, required: true },
    orderId: { type: String, default: null },
    payload: { type: Schema.Types.Mixed, required: true },
    signature: { type: String, required: true },
    processed: { type: Boolean, default: false },
    processedAt: { type: Date, default: null },
    error: { type: String, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

// Idempotency: one record per (provider, event-type, entity).
// Note: if a legacy "uniq_provider_entity" index exists in MongoDB, drop it:
//   db.webhookevents.dropIndex("uniq_provider_entity")
webhookEventSchema.index(
  { provider: 1, event: 1, entityId: 1 },
  { unique: true, name: "uniq_provider_event_entity" },
);

webhookEventSchema.index({ processed: 1 }, { name: "idx_processed" });

webhookEventSchema.index({ createdAt: -1 }, { name: "idx_createdAt_desc" });

export type IWebhookEvent = InferSchemaType<typeof webhookEventSchema> & {
  _id: mongoose.Types.ObjectId;
};

const WebhookEvent =
  (mongoose.models.WebhookEvent as mongoose.Model<IWebhookEvent>) ??
  mongoose.model<IWebhookEvent>("WebhookEvent", webhookEventSchema);

export default WebhookEvent;

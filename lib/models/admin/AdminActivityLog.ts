import mongoose, { Schema, type InferSchemaType } from "mongoose";

const adminActivityLogSchema = new Schema(
  {
    // References the Admin model (the primary model used across all API routes)
    adminId: { type: Schema.Types.ObjectId, ref: "Admin", required: true },
    // Denormalized fields so the log is self-contained even if admin is deleted
    adminName: { type: String, default: null },
    adminUsername: { type: String, default: null },
    adminRole: { type: String, required: true, index: true },
    action: { type: String, required: true },
    module: {
      type: String,
      enum: ["CRM", "FRM", "COMMS", "CALENDAR", "LEDGER", "ADMIN_MGMT", "USER_MGMT"],
      required: true,
    },
    targetType: { type: String, required: true },
    // Human-readable ID of the resource (e.g. P-310526001, AOTF-ENQ-001)
    targetRefId: { type: String, default: null },
    targetId: { type: Schema.Types.ObjectId, required: true },
    targetSnapshot: { type: Schema.Types.Mixed, default: null },
    diff: {
      before: { type: Schema.Types.Mixed, default: null },
      after: { type: Schema.Types.Mixed, default: null },
    },
    // Stores context like enquiryId, postId, jobId for narrative display
    metadata: { type: Schema.Types.Mixed, default: {} },
    ipAddress: { type: String, default: null },
    os: { type: String, default: null },
    browser: { type: String, default: null },
    location: {
      city: { type: String, default: null },
      country: { type: String, default: null },
    },
    sessionId: { type: String, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

adminActivityLogSchema.index({ adminId: 1, createdAt: -1 });
adminActivityLogSchema.index({ module: 1, createdAt: -1 });
adminActivityLogSchema.index({ adminRole: 1, action: 1 });

export type IAdminActivityLog = InferSchemaType<typeof adminActivityLogSchema> & {
  _id: mongoose.Types.ObjectId;
};

const AdminActivityLog =
  (mongoose.models.AdminActivityLog as mongoose.Model<IAdminActivityLog>) ??
  mongoose.model<IAdminActivityLog>("AdminActivityLog", adminActivityLogSchema);

export default AdminActivityLog;

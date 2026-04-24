import mongoose, { Schema, type InferSchemaType } from "mongoose";

const adminActivityLogSchema = new Schema(
  {
    adminId: { type: Schema.Types.ObjectId, ref: "AdminUser", required: true },
    adminRole: { type: String, required: true, index: true },
    action: { type: String, required: true },
    module: {
      type: String,
      enum: ["CRM", "FRM", "COMMS", "CALENDAR", "LEDGER", "ADMIN_MGMT"],
      required: true,
    },
    targetType: { type: String, required: true },
    targetId: { type: Schema.Types.ObjectId, required: true },
    targetSnapshot: { type: Schema.Types.Mixed, default: null },
    diff: {
      before: { type: Schema.Types.Mixed, default: null },
      after: { type: Schema.Types.Mixed, default: null },
    },
    metadata: { type: Schema.Types.Mixed, default: {} },
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

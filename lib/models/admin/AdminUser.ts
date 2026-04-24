import mongoose, { Schema, type InferSchemaType } from "mongoose";

const adminUserSchema = new Schema(
  {
    clerkUserId: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    role: { type: String, required: true, index: true },
    status: {
      type: String,
      enum: ["INVITED", "ACTIVE", "SUSPENDED", "TERMINATED"],
      required: true,
      default: "INVITED",
      index: true,
    },
    invitedBy: { type: Schema.Types.ObjectId, ref: "AdminUser", default: null },
    invitedAt: { type: Date, default: Date.now },
    activatedAt: { type: Date, default: null },
    terminatedAt: { type: Date, default: null },
    terminatedBy: { type: Schema.Types.ObjectId, ref: "AdminUser", default: null },
    location: {
      city: { type: String, default: null },
      timezone: { type: String, default: null },
    },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

adminUserSchema.index({ clerkUserId: 1 }, { unique: true });
adminUserSchema.index({ role: 1 });
adminUserSchema.index({ status: 1 });
adminUserSchema.index({ email: 1 });

export type IAdminUser = InferSchemaType<typeof adminUserSchema> & {
  _id: mongoose.Types.ObjectId;
};

const AdminUser =
  (mongoose.models.AdminUser as mongoose.Model<IAdminUser>) ??
  mongoose.model<IAdminUser>("AdminUser", adminUserSchema);

export default AdminUser;

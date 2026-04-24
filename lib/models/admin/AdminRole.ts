import mongoose, { Schema, type InferSchemaType } from "mongoose";

const adminRoleSchema = new Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    displayName: { type: String, required: true, trim: true },
    level: { type: Number, required: true, min: 0 },
    permissions: { type: [String], default: [] },
    isSystemRole: { type: Boolean, default: false },
  },
  { timestamps: true },
);

adminRoleSchema.index({ name: 1 }, { unique: true });

export type IAdminRole = InferSchemaType<typeof adminRoleSchema> & {
  _id: mongoose.Types.ObjectId;
};

const AdminRole =
  (mongoose.models.AdminRole as mongoose.Model<IAdminRole>) ??
  mongoose.model<IAdminRole>("AdminRole", adminRoleSchema);

export default AdminRole;

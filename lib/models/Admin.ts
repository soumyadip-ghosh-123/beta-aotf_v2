import mongoose, { Schema, type InferSchemaType } from "mongoose";

const permissionsSchema = new Schema(
  {
    canManageUsers: { type: Boolean, default: false },
    canManagePosts: { type: Boolean, default: false },
    canManageJobs: { type: Boolean, default: false },
    canProcessRefunds: { type: Boolean, default: false },
    canViewAnalytics: { type: Boolean, default: false },
    canManageAdmins: { type: Boolean, default: false },
  },
  { _id: false },
);

const adminSchema = new Schema(
  {
    clerkId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: { type: String, required: true },
    role: {
      type: String,
      enum: ["super_admin", "admin", "moderator"],
      required: true,
    },
    permissions: { type: permissionsSchema, default: () => ({}) },
    isActive: { type: Boolean, default: true },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },
  },
  { timestamps: true },
);

export type IAdmin = InferSchemaType<typeof adminSchema> & {
  _id: mongoose.Types.ObjectId;
};

const Admin =
  (mongoose.models.Admin as mongoose.Model<IAdmin>) ??
  mongoose.model<IAdmin>("Admin", adminSchema);

export default Admin;

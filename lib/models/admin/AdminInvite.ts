import mongoose, { Schema, type InferSchemaType } from "mongoose";

const adminInviteSchema = new Schema(
  {
    token: { type: String, required: true, unique: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    assignedRole: { type: String, required: true, trim: true },
    invitedBy: { type: Schema.Types.ObjectId, ref: "AdminUser", required: true },
    inviteeName: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["PENDING", "ACCEPTED", "EXPIRED", "REVOKED"],
      required: true,
      default: "PENDING",
    },
    expiresAt: { type: Date, required: true },
    acceptedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

adminInviteSchema.index({ email: 1 });
adminInviteSchema.index({ status: 1 });

export type IAdminInvite = InferSchemaType<typeof adminInviteSchema> & {
  _id: mongoose.Types.ObjectId;
};

const AdminInvite =
  (mongoose.models.AdminInvite as mongoose.Model<IAdminInvite>) ??
  mongoose.model<IAdminInvite>("AdminInvite", adminInviteSchema);

export default AdminInvite;

import mongoose, { Schema, type Document, type Model, models } from "mongoose";

// ─── Main document ──────────────────────────────────────────────────────

export interface IAdminLedger extends Document {
  /** Clerk ID of the admin — unique key for upserts */
  clerkId: string;
  adminObjectId: mongoose.Types.ObjectId;
  adminName: string;
  role: string;
  /** Joining date = Admin.createdAt */
  joiningDate: Date;
  /** Snapshot of permission keys that are true */
  permissionsSummary: string;
  /** Comma-separated enquiry IDs this admin has been involved in */
  activityEnquiryIds: string[];
  /** Comma-separated post IDs (tuitions) this admin has processed */
  activityTuitionIds: string[];
  /** Comma-separated job IDs this admin has processed */
  activityJobIds: string[];
  /** Whether AOTF has paid this admin (manually entered) */
  paymentDone: boolean;
  /** Amount paid (manually entered) */
  paymentAmount: number | null;
  /** Remarks about the payment (manually entered) */
  paymentRemarks: string | null;
  /** Date of payment (manually entered) */
  paymentDate: Date | null;
  /** Resignation / termination date = Admin.terminatedAt */
  resignationDate: Date | null;
  isActive: boolean;
  sheetRowIndex: number | null;
  lastUpdatedAt: Date;
}

const AdminLedgerSchema = new Schema<IAdminLedger>(
  {
    clerkId: { type: String, required: true, unique: true, index: true },
    adminObjectId: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    adminName: { type: String, required: true },
    role: { type: String, required: true },
    joiningDate: { type: Date, required: true },
    permissionsSummary: { type: String, default: "" },
    activityEnquiryIds: { type: [String], default: () => [] },
    activityTuitionIds: { type: [String], default: () => [] },
    activityJobIds: { type: [String], default: () => [] },

    // ─── Manual payment fields ────────────────────────────────────────────
    paymentDone: { type: Boolean, default: false },
    paymentAmount: { type: Number, default: null },
    paymentRemarks: { type: String, default: null },
    paymentDate: { type: Date, default: null },

    resignationDate: { type: Date, default: null },
    isActive: { type: Boolean, default: true },
    sheetRowIndex: { type: Number, default: null },
    lastUpdatedAt: { type: Date, required: true, default: () => new Date() },
  },
  {
    collection: "admin_ledgers",
  },
);

AdminLedgerSchema.index({ role: 1, isActive: 1 });
AdminLedgerSchema.index({ lastUpdatedAt: -1 });

const AdminLedger: Model<IAdminLedger> =
  models.AdminLedger ||
  mongoose.model<IAdminLedger>("AdminLedger", AdminLedgerSchema);

export default AdminLedger;

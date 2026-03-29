import mongoose, { Schema, type Document, type Model, models } from "mongoose";

// ─── Enums ──────────────────────────────────────────────────────────────

export const POST_LEDGER_STATUSES = ["open", "assigned", "closed"] as const;
export type PostLedgerStatus = (typeof POST_LEDGER_STATUSES)[number];

export const PAYMENT_STATUSES = ["unpaid", "paid"] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

// ─── Sub-documents ──────────────────────────────────────────────────────

export interface IPostLedgerStudent {
  className: string;
  board: string;
  subjects: string[];
  // Stored to keep your existing search/normalization behavior consistent.
  subjectsNormalized: string[];
}

const PostLedgerStudentSchema = new Schema<IPostLedgerStudent>(
  {
    className: { type: String, required: true },
    board: { type: String, required: true },
    subjects: { type: [String], required: true },
    subjectsNormalized: { type: [String], default: [] },
  },
  { _id: false },
);

export interface IPostLedgerStatusHistoryEntry {
  status: PostLedgerStatus;
  changedAt: Date;
  changedByClerkId: string | null;
}

const PostLedgerStatusHistoryEntrySchema =
  new Schema<IPostLedgerStatusHistoryEntry>(
    {
      status: { type: String, enum: POST_LEDGER_STATUSES, required: true },
      changedAt: { type: Date, required: true },
      changedByClerkId: { type: String, default: null },
    },
    { _id: false },
  );

// ─── Main document ─────────────────────────────────────────────────────

export interface IPostLedger extends Document {
  serialNumber: number | null;
  postId: string;
  postCreatedAt: Date;

  enquiryId: string | null;

  guardianName: string;
  guardianPhone: string;
  students: IPostLedgerStudent[];

  classType: string;
  location: string;
  monthlyBudget: number;
  notes?: string | null;

  postStatus: PostLedgerStatus;

  assignedTeacherId: string | null;
  assignedTeacherName: string | null;
  assignedTeacherPhone: string | null;
  assignedAt: Date | null;

  processedByAdminClerkId: string | null;

  paymentStatus: PaymentStatus;
  paymentDate: Date | null;
  paymentAmount: number | null;

  lastUpdatedAt: Date;

  sheetRowIndex: number | null;
  statusHistory: IPostLedgerStatusHistoryEntry[];
  teacherChangeCount: number;
}

const PostLedgerSchema = new Schema<IPostLedger>(
  {
    serialNumber: { type: Number, default: null },

    postId: { type: String, required: true, unique: true, index: true },

    postCreatedAt: { type: Date, required: true },
    enquiryId: { type: String, default: null, index: true },

    guardianName: { type: String, required: true },
    guardianPhone: { type: String, required: true },
    students: { type: [PostLedgerStudentSchema], required: true },

    classType: { type: String, required: true },
    location: { type: String, required: true },
    monthlyBudget: { type: Number, required: true },
    notes: { type: String, default: null },

    postStatus: {
      type: String,
      enum: POST_LEDGER_STATUSES,
      required: true,
      default: "open",
    },

    assignedTeacherId: { type: String, default: null, index: true },
    assignedTeacherName: { type: String, default: null },
    assignedTeacherPhone: { type: String, default: null },
    assignedAt: { type: Date, default: null },

    processedByAdminClerkId: { type: String, default: null },

    paymentStatus: {
      type: String,
      enum: PAYMENT_STATUSES,
      required: true,
      default: "unpaid",
    },
    paymentDate: { type: Date, default: null },
    paymentAmount: { type: Number, default: null },

    lastUpdatedAt: { type: Date, required: true, default: () => new Date() },

    sheetRowIndex: { type: Number, default: null },
    statusHistory: {
      type: [PostLedgerStatusHistoryEntrySchema],
      default: () => [],
    },

    teacherChangeCount: { type: Number, default: 0 },
  },
  {
    collection: "post_ledgers",
  },
);

PostLedgerSchema.index({ postStatus: 1, lastUpdatedAt: -1 });

const PostLedger: Model<IPostLedger> =
  models.PostLedger || mongoose.model<IPostLedger>("PostLedger", PostLedgerSchema);

export default PostLedger;


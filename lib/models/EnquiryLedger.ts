import mongoose, { Schema, type Document, type Model, models } from "mongoose";
import { type EnquiryStatus, ENQUIRY_STATUSES } from "./Enquiry";

// ─── Enums ───────────────────────────────────────────────────────────────

export const ENQUIRY_RESULTS = ["converted", "declined", "pending"] as const;
export type EnquiryResult = (typeof ENQUIRY_RESULTS)[number];

// ─── Main document ────────────────────────────────────────────────────────

export interface IEnquiryLedger extends Document {
  /** Human-readable enquiry ID \u2014 unique key for upserts */
  enquiryId: string;
  enquiryObjectId: mongoose.Types.ObjectId;
  serialNumber: number | null;
  /** Date of the enquiry (= Enquiry.createdAt) */
  date: Date;
  /** postId of the Post created from this enquiry (Post.enquiryId match) */
  linkedPostId: string | null;
  /** jobIdPublic of the Job created from this enquiry */
  linkedJobId: string | null;
  currentStatus: EnquiryStatus;
  /**
   * Derived result:
   *  - resolved  → converted
   *  - closed    → declined
   *  - anything else → pending
   */
  result: EnquiryResult;
  sheetRowIndex: number | null;
  lastUpdatedAt: Date;
}

const EnquiryLedgerSchema = new Schema<IEnquiryLedger>(
  {
    enquiryId: { type: String, required: true, unique: true, index: true },
    enquiryObjectId: {
      type: Schema.Types.ObjectId,
      ref: "Enquiry",
      required: true,
    },
    serialNumber: { type: Number, default: null },
    date: { type: Date, required: true },
    linkedPostId: { type: String, default: null },
    linkedJobId: { type: String, default: null },
    currentStatus: {
      type: String,
      enum: ENQUIRY_STATUSES,
      required: true,
    },
    result: {
      type: String,
      enum: ENQUIRY_RESULTS,
      required: true,
      default: "pending",
    },
    sheetRowIndex: { type: Number, default: null },
    lastUpdatedAt: { type: Date, required: true, default: () => new Date() },
  },
  {
    collection: "enquiry_ledgers",
  },
);

EnquiryLedgerSchema.index({ currentStatus: 1, lastUpdatedAt: -1 });
EnquiryLedgerSchema.index({ result: 1 });

const EnquiryLedger: Model<IEnquiryLedger> =
  models.EnquiryLedger ||
  mongoose.model<IEnquiryLedger>("EnquiryLedger", EnquiryLedgerSchema);

export default EnquiryLedger;

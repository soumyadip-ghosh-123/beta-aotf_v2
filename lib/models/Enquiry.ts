import mongoose, { Schema, Document, Model, models } from "mongoose";
import {
  upsertCalendarEvent,
  deleteCalendarEvent,
  mapEnquiry,
  enquiryEventKey,
} from "@/lib/services/calendar-event.service";

export const ENQUIRY_STATUSES = [
  "new",
  "in_progress",
  "contacted",
  "unreachable",
  "resolved",
  "closed",
] as const;

export type EnquiryStatus = (typeof ENQUIRY_STATUSES)[number];

export interface IEnquiry extends Document {
  enquiryId: string;
  name: string;
  phoneNumber: string;
  query: string;
  currentStatus: EnquiryStatus;
  firstResponseAt?: Date;
  resolvedAt?: Date;
  lastActionNote?: string;
  createdAt: Date;
  updatedAt: Date;
  lastActionByAdminId?: mongoose.Types.ObjectId;
  lastActionAt?: Date;
}

const EnquirySchema = new Schema<IEnquiry>(
  {
    enquiryId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    query: { type: String, required: true },
    currentStatus: {
      type: String,
      enum: ENQUIRY_STATUSES,
      required: true,
      default: "new",
    },
    firstResponseAt: { type: Date },
    resolvedAt: { type: Date },
    lastActionNote: { type: String },
    lastActionByAdminId: { type: Schema.Types.ObjectId },
    lastActionAt: { type: Date },
  },
  {
    timestamps: true, // auto createdAt & updatedAt
    collection: "enquires", // match your collection name
  },
);

// Indexes matching DB design
EnquirySchema.index({ enquiryId: 1 }, { name: "enquiry_ix_1", unique: true });
EnquirySchema.index(
  { currentStatus: 1, createdAt: -1 },
  { name: "enquiry_ix_2" },
);
EnquirySchema.index({ phoneNumber: 1 }, { name: "enquiry_ix_3" });
EnquirySchema.index(
  { phoneNumber: 1, currentStatus: 1 },
  { name: "enquiry_ix_4" },
);

// ─── Calendar write-through hooks ──────────────────────────────────────────

EnquirySchema.post("save", function (doc) {
  void upsertCalendarEvent(mapEnquiry(doc.toObject()));
});

EnquirySchema.post("findOneAndUpdate", function (doc) {
  if (!doc) return;
  const raw = typeof doc.toObject === "function" ? doc.toObject() : (doc as unknown as Record<string, any>);
  void upsertCalendarEvent(mapEnquiry(raw));
});

EnquirySchema.post("findOneAndDelete", function (doc) {
  if (!doc) return;
  const raw = typeof doc.toObject === "function" ? doc.toObject() : (doc as unknown as Record<string, any>);
  void deleteCalendarEvent(enquiryEventKey(raw._id?.toString?.() ?? ""));
});

const Enquiry: Model<IEnquiry> =
  models.Enquiry || mongoose.model<IEnquiry>("Enquiry", EnquirySchema);

export default Enquiry;

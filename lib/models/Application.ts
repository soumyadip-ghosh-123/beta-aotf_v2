import mongoose, { Schema, Document, Model, models } from "mongoose";

// ─── Enums ──────────────────────────────────────────────────────────────

export const APPLICANT_TYPES = ["teacher", "candidate"] as const;
export type ApplicantType = (typeof APPLICANT_TYPES)[number];

export const APPLICATION_STATUSES = [
  "applied",
  "DC",
  "GC",
  "approved",
  "decline",
  "auto_declined",
  "withdrawn",
] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

// ─── Sub-documents ──────────────────────────────────────────────────────

export interface IApplicantSnapshot {
  name: string;
  email: string;
  phone: string;
}

const ApplicantSnapshotSchema = new Schema<IApplicantSnapshot>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
  },
  { _id: false },
);

export interface IDeclineMeta {
  reason?: string;
  autoDeclinedBecauseApplicationId?: mongoose.Types.ObjectId;
  declinedByAdminId?: mongoose.Types.ObjectId;
  declinedAt?: Date;
}

const DeclineMetaSchema = new Schema<IDeclineMeta>(
  {
    reason: { type: String },
    autoDeclinedBecauseApplicationId: { type: Schema.Types.ObjectId },
    declinedByAdminId: { type: Schema.Types.ObjectId },
    declinedAt: { type: Date },
  },
  { _id: false },
);

export interface IApprovalMeta {
  approvedByAdminId?: mongoose.Types.ObjectId;
  approvedAt?: Date;
}

const ApprovalMetaSchema = new Schema<IApprovalMeta>(
  {
    approvedByAdminId: { type: Schema.Types.ObjectId },
    approvedAt: { type: Date },
  },
  { _id: false },
);

export interface IDCMeta {
  scheduledDate: Date;
  setByAdminId: mongoose.Types.ObjectId;
  setAt: Date;
}

const DCMetaSchema = new Schema<IDCMeta>(
  {
    scheduledDate: { type: Date, required: true },
    setByAdminId: { type: Schema.Types.ObjectId, required: true },
    setAt: { type: Date, required: true },
  },
  { _id: false },
);

export interface IGCMeta {
  scheduledDate: Date;
  setByAdminId: mongoose.Types.ObjectId;
  setAt: Date;
}

const GCMetaSchema = new Schema<IGCMeta>(
  {
    scheduledDate: { type: Date, required: true },
    setByAdminId: { type: Schema.Types.ObjectId, required: true },
    setAt: { type: Date, required: true },
  },
  { _id: false },
);

// ─── Main Document: Application ─────────────────────────────────────────

export interface IApplication extends Document {
  applicationId: string;
  jobId?: mongoose.Types.ObjectId;
  jobIdPublic?: string;
  postId?: string;
  applicantId: mongoose.Types.ObjectId;
  profileId: string;
  applicantType: ApplicantType;
  applicantSnapshot: IApplicantSnapshot;
  coverLetter?: string;
  status: ApplicationStatus;
  dcDate?: Date;
  dcMeta?: IDCMeta;
  gcMeta?: IGCMeta;
  declineMeta?: IDeclineMeta;
  approvalMeta?: IApprovalMeta;
  isActive: boolean;
  appliedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ApplicationSchema = new Schema<IApplication>(
  {
    applicationId: { type: String, required: true },
    jobId: { type: Schema.Types.ObjectId, ref: "Job" },
    jobIdPublic: { type: String },
    postId: { type: String },
    applicantId: { type: Schema.Types.ObjectId, required: true },
    profileId: { type: String, required: true },
    applicantType: {
      type: String,
      enum: APPLICANT_TYPES,
      required: true,
    },
    applicantSnapshot: {
      type: ApplicantSnapshotSchema,
      required: true,
    },
    coverLetter: { type: String },
    status: {
      type: String,
      enum: APPLICATION_STATUSES,
      required: true,
      default: "applied",
    },
    dcDate: { type: Date },
    dcMeta: { type: DCMetaSchema },
    gcMeta: { type: GCMetaSchema },
    declineMeta: { type: DeclineMetaSchema },
    approvalMeta: { type: ApprovalMetaSchema },
    isActive: { type: Boolean, required: true, default: true },
    appliedAt: { type: Date, required: true, default: Date.now },
  },
  {
    timestamps: true,
    collection: "applications",
  },
);

// ─── Indexes ────────────────────────────────────────────────────────────

ApplicationSchema.index({ applicationId: 1 }, { unique: true });
ApplicationSchema.index({ applicantId: 1 });
ApplicationSchema.index({ jobId: 1 });
ApplicationSchema.index({ postId: 1 });
ApplicationSchema.index({ status: 1 });
ApplicationSchema.index(
  { jobId: 1, applicantId: 1 },
  { unique: true, sparse: true },
);
ApplicationSchema.index(
  { postId: 1, applicantId: 1, applicantType: 1 },
  {
    unique: true,
    partialFilterExpression: {
      postId: { $type: "string" },
      applicantId: { $exists: true },
      applicantType: { $exists: true },
    },
  },
);
ApplicationSchema.index({ jobId: 1, status: 1 });
ApplicationSchema.index({ postId: 1, status: 1 });
ApplicationSchema.index({ applicantId: 1, status: 1 });
ApplicationSchema.index({ applicantType: 1, status: 1 });
ApplicationSchema.index({ appliedAt: -1 });

const Application: Model<IApplication> =
  models.Application ||
  mongoose.model<IApplication>("Application", ApplicationSchema);

export default Application;

import mongoose, { Schema, Document, Model, models } from "mongoose";

// ─── Enums ──────────────────────────────────────────────────────────────

export const CLASS_TYPES = ["online", "offline", "both"] as const;
export type ClassType = (typeof CLASS_TYPES)[number];

export const POST_STATUSES = [
  "open",
  "matched",
  "closed",
  "cancelled",
  "hold",
] as const;
export type PostStatus = (typeof POST_STATUSES)[number];

// ─── Sub-document: Student ──────────────────────────────────────────────

export interface IStudent {
  className: string;
  board: string;
  subjects: string[];
  subjectsNormalized: string[];
}

const StudentSchema = new Schema<IStudent>(
  {
    className: { type: String, required: true },
    board: { type: String, required: true },
    subjects: { type: [String], required: true },
    subjectsNormalized: { type: [String], default: [] },
  },
  { _id: false },
);

// ─── Main Document: Post ────────────────────────────────────────────────

export interface IPost extends Document {
  postId: string;
  enquiryId?: mongoose.Types.ObjectId;
  guardianName: string;
  guardianPhone: string;
  students: IStudent[];
  classType: ClassType;
  frequencyPerWeek: number;
  preferredDays: string[];
  preferredTime?: string;
  location: string;
  monthlyBudget: number;
  notes?: string;
  status: PostStatus;
  matchedTeacherId?: mongoose.Types.ObjectId;
  createdByAdminId?: mongoose.Types.ObjectId;
  updatedByAdminId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PostSchema = new Schema<IPost>(
  {
    postId: { type: String, required: true, unique: true },
    enquiryId: { type: Schema.Types.ObjectId },
    guardianName: { type: String, required: true },
    guardianPhone: { type: String, required: true },
    students: {
      type: [StudentSchema],
      required: true,
      validate: {
        validator: (v: IStudent[]) => Array.isArray(v) && v.length > 0,
        message: "At least one student is required",
      },
    },
    classType: {
      type: String,
      enum: CLASS_TYPES,
      required: true,
    },
    frequencyPerWeek: { type: Number, required: true },
    preferredDays: { type: [String], default: [] },
    preferredTime: { type: String },
    location: { type: String, required: true },
    monthlyBudget: { type: Number, required: true },
    notes: { type: String },
    status: {
      type: String,
      enum: POST_STATUSES,
      required: true,
      default: "open",
    },
    matchedTeacherId: { type: Schema.Types.ObjectId },
    createdByAdminId: { type: Schema.Types.ObjectId },
    updatedByAdminId: { type: Schema.Types.ObjectId },
  },
  {
    timestamps: true,
    collection: "posts",
  },
);

const Post: Model<IPost> =
  models.Post || mongoose.model<IPost>("Post", PostSchema);

export default Post;

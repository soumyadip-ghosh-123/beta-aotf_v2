import mongoose, { Schema, type InferSchemaType } from "mongoose";

export const REVIEW_STATUSES = ["active", "hidden"] as const;
export type ReviewStatus = (typeof REVIEW_STATUSES)[number];

const reviewSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    userSnapshot: {
      username: { type: String, required: true, trim: true, lowercase: true },
      name: { type: String, required: true, trim: true },
      imageUrl: { type: String, default: null },
      role: {
        type: String,
        enum: ["teacher", "teacher_candidate", "admin"],
        required: true,
      },
    },
    rating: { type: Number, min: 1, max: 5, required: true },
    title: { type: String, trim: true, default: null },
    message: { type: String, trim: true, required: true },
    status: {
      type: String,
      enum: REVIEW_STATUSES,
      default: "active",
      index: true,
    },
    createdByAdminId: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    updatedByAdminId: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },
  },
  { timestamps: true, collection: "reviews" },
);

reviewSchema.index({ status: 1, createdAt: -1 }, { background: true });
reviewSchema.index(
  { "userSnapshot.username": 1, createdAt: -1 },
  { background: true },
);

export type IReview = InferSchemaType<typeof reviewSchema> & {
  _id: mongoose.Types.ObjectId;
};

const Review =
  (mongoose.models.Review as mongoose.Model<IReview>) ??
  mongoose.model<IReview>("Review", reviewSchema);

export default Review;

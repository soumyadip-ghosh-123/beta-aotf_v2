import mongoose, { Schema, Document, Model, models } from "mongoose";

// ─── Enums ──────────────────────────────────────────────────────────────

export const AD_STATUSES = [
  "active",
  "inactive",
  "scheduled",
  "expired",
] as const;
export type AdStatus = (typeof AD_STATUSES)[number];

export const AD_PLACEMENTS = [
  "home_banner",
  "sidebar",
  "feed_inline",
  "popup",
  "footer",
] as const;
export type AdPlacement = (typeof AD_PLACEMENTS)[number];

export const AD_TYPES = ["image", "text", "html"] as const;
export type AdType = (typeof AD_TYPES)[number];

// ─── Main Document: Ad ──────────────────────────────────────────────────

export interface IAd extends Document {
  adId: string;
  title: string;
  adType: AdType;
  placement: AdPlacement;
  /** Image URL (for image ads) */
  imageUrl?: string;
  /** Text content (for text/html ads) */
  content?: string;
  /** Click-through URL */
  targetUrl?: string;
  /** Advertiser / client name */
  advertiser: string;
  status: AdStatus;
  /** Scheduling */
  startDate?: Date;
  endDate?: Date;
  /** Priority (higher = shown first when multiple ads compete for a slot) */
  priority: number;
  /** Analytics */
  impressions: number;
  clicks: number;
  /** Notes */
  notes?: string;
  createdByAdminId?: mongoose.Types.ObjectId;
  updatedByAdminId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const AdSchema = new Schema<IAd>(
  {
    adId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    adType: {
      type: String,
      enum: AD_TYPES,
      required: true,
    },
    placement: {
      type: String,
      enum: AD_PLACEMENTS,
      required: true,
    },
    imageUrl: { type: String },
    content: { type: String },
    targetUrl: { type: String },
    advertiser: { type: String, required: true },
    status: {
      type: String,
      enum: AD_STATUSES,
      required: true,
      default: "inactive",
    },
    startDate: { type: Date },
    endDate: { type: Date },
    priority: { type: Number, required: true, default: 0 },
    impressions: { type: Number, required: true, default: 0 },
    clicks: { type: Number, required: true, default: 0 },
    notes: { type: String },
    createdByAdminId: { type: Schema.Types.ObjectId },
    updatedByAdminId: { type: Schema.Types.ObjectId },
  },
  {
    timestamps: true,
    collection: "ads",
  },
);

// ─── Indexes ────────────────────────────────────────────────────────────

AdSchema.index({ adId: 1 }, { unique: true });
AdSchema.index({ status: 1, placement: 1 });
AdSchema.index({ startDate: 1, endDate: 1 });
AdSchema.index({ createdAt: -1 });

const Ad: Model<IAd> = models.Ad || mongoose.model<IAd>("Ad", AdSchema);

export default Ad;

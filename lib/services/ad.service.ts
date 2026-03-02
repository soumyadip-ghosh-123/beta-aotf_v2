import mongoose from "mongoose";
import dbConnect from "@/lib/db";
import Ad, { type IAd } from "@/lib/models/Ad";
import { ConflictError, NotFoundError } from "@/lib/errors";
import { escapeRegex } from "@/lib/utils";
import type {
  CreateAdInput,
  UpdateAdInput,
  ListAdsInput,
} from "@/lib/validations/ad";

// ─── Types returned to route handlers ───────────────────────────────────

export interface PaginatedAds {
  ads: IAd[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AdAnalytics {
  totalAds: number;
  activeAds: number;
  scheduledAds: number;
  expiredAds: number;
  totalImpressions: number;
  totalClicks: number;
  overallCtr: number;
}

// ─── Helpers ────────────────────────────────────────────────────────────

/**
 * Generate a unique ad ID in the format `AD-DDMMYYNN`.
 * NN is a 2-digit daily counter (00–99).
 */
async function generateAdId(): Promise<string> {
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, "0");
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const yy = String(now.getFullYear()).slice(-2);
  const prefix = `AD-${dd}${mm}${yy}`;

  const lastAd = await Ad.findOne({
    adId: mongoose.trusted({ $regex: `^${prefix}` }),
  })
    .sort({ adId: -1 })
    .lean();

  let counter = 0;
  if (lastAd) {
    const lastCounter = parseInt(lastAd.adId.slice(-2), 10);
    counter = lastCounter + 1;
  }

  if (counter > 99) {
    throw new ConflictError(
      "Daily ad limit (100) reached. Please try again tomorrow.",
    );
  }

  return `${prefix}${String(counter).padStart(2, "0")}`;
}

// ─── Service Functions ──────────────────────────────────────────────────

/**
 * Create a new ad (admin-facing).
 */
export async function createAd(input: CreateAdInput): Promise<IAd> {
  await dbConnect();

  const adId = await generateAdId();

  const ad = await Ad.create({
    adId,
    title: input.title,
    adType: input.adType,
    placement: input.placement,
    imageUrl: input.imageUrl,
    content: input.content,
    targetUrl: input.targetUrl,
    advertiser: input.advertiser,
    status: input.status ?? "inactive",
    startDate: input.startDate,
    endDate: input.endDate,
    priority: input.priority ?? 0,
    notes: input.notes,
    createdByAdminId: input.createdByAdminId
      ? new mongoose.Types.ObjectId(input.createdByAdminId)
      : undefined,
  });

  return ad;
}

/**
 * Get a single ad by adId.
 */
export async function getAdByAdId(adId: string): Promise<IAd> {
  await dbConnect();

  const ad = await Ad.findOne({ adId }).lean<IAd>();
  if (!ad) {
    throw new NotFoundError("Ad");
  }
  return ad;
}

/**
 * List ads with pagination, optional status/placement filter, and search.
 */
export async function listAds(input: ListAdsInput): Promise<PaginatedAds> {
  await dbConnect();

  const { status, placement, page, limit, search } = input;

  const filter: Record<string, unknown> = {};
  if (status && status !== "all") {
    filter.status = status;
  }
  if (placement && placement !== "all") {
    filter.placement = placement;
  }
  if (search) {
    const searchRegex = mongoose.trusted({
      $regex: escapeRegex(search),
      $options: "i",
    });
    filter.$or = mongoose.trusted([
      { adId: searchRegex },
      { title: searchRegex },
      { advertiser: searchRegex },
      { notes: searchRegex },
    ]);
  }

  const [ads, total] = await Promise.all([
    Ad.find(filter)
      .sort({ priority: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean<IAd[]>(),
    Ad.countDocuments(filter),
  ]);

  return {
    ads,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Update an ad by adId.
 */
export async function updateAd(
  adId: string,
  input: UpdateAdInput,
): Promise<IAd> {
  await dbConnect();

  const updateData: Record<string, unknown> = { ...input };

  if (input.updatedByAdminId) {
    updateData.updatedByAdminId = new mongoose.Types.ObjectId(
      input.updatedByAdminId,
    );
  }

  const ad = await Ad.findOneAndUpdate({ adId }, updateData, {
    new: true,
    runValidators: true,
  }).lean<IAd>();

  if (!ad) {
    throw new NotFoundError("Ad");
  }

  return ad;
}

/**
 * Delete an ad by adId.
 */
export async function deleteAd(adId: string): Promise<void> {
  await dbConnect();

  const result = await Ad.findOneAndDelete({ adId });
  if (!result) {
    throw new NotFoundError("Ad");
  }
}

/**
 * Increment impression count for an ad.
 */
export async function recordImpression(adId: string): Promise<void> {
  await dbConnect();

  const result = await Ad.findOneAndUpdate(
    { adId },
    { $inc: { impressions: 1 } },
  );
  if (!result) {
    throw new NotFoundError("Ad");
  }
}

/**
 * Increment click count for an ad.
 */
export async function recordClick(adId: string): Promise<void> {
  await dbConnect();

  const result = await Ad.findOneAndUpdate(
    { adId },
    { $inc: { clicks: 1 } },
  );
  if (!result) {
    throw new NotFoundError("Ad");
  }
}

/**
 * Get aggregate analytics for all ads.
 */
export async function getAdAnalytics(): Promise<AdAnalytics> {
  await dbConnect();

  const [result] = await Ad.aggregate([
    {
      $group: {
        _id: null,
        totalAds: { $sum: 1 },
        activeAds: {
          $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] },
        },
        scheduledAds: {
          $sum: { $cond: [{ $eq: ["$status", "scheduled"] }, 1, 0] },
        },
        expiredAds: {
          $sum: { $cond: [{ $eq: ["$status", "expired"] }, 1, 0] },
        },
        totalImpressions: { $sum: "$impressions" },
        totalClicks: { $sum: "$clicks" },
      },
    },
  ]);

  if (!result) {
    return {
      totalAds: 0,
      activeAds: 0,
      scheduledAds: 0,
      expiredAds: 0,
      totalImpressions: 0,
      totalClicks: 0,
      overallCtr: 0,
    };
  }

  const ctr =
    result.totalImpressions > 0
      ? parseFloat(
          ((result.totalClicks / result.totalImpressions) * 100).toFixed(2),
        )
      : 0;

  return {
    totalAds: result.totalAds,
    activeAds: result.activeAds,
    scheduledAds: result.scheduledAds,
    expiredAds: result.expiredAds,
    totalImpressions: result.totalImpressions,
    totalClicks: result.totalClicks,
    overallCtr: ctr,
  };
}

/**
 * Sync ad statuses based on scheduling dates.
 * - "scheduled" ads whose startDate has passed → "active"
 * - "active" / "scheduled" ads whose endDate has passed → "expired"
 */
export async function syncAdStatuses(): Promise<number> {
  await dbConnect();

  const now = new Date();
  let modified = 0;

  // Expire ads whose endDate has passed
  const expireResult = await Ad.updateMany(
    {
      status: { $in: ["active", "scheduled"] },
      endDate: { $lte: now },
    },
    { $set: { status: "expired" } },
  );
  modified += expireResult.modifiedCount;

  // Activate scheduled ads whose startDate has passed (and not yet expired)
  const activateResult = await Ad.updateMany(
    {
      status: "scheduled",
      startDate: { $lte: now },
      $or: [{ endDate: { $gt: now } }, { endDate: { $exists: false } }],
    },
    { $set: { status: "active" } },
  );
  modified += activateResult.modifiedCount;

  return modified;
}

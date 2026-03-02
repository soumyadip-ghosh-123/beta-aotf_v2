import { NextRequest, NextResponse } from "next/server";
import {
  handleApiError,
  checkCsrfOrigin,
  checkRateLimit,
  getClientIp,
  checkJsonContentType,
} from "@/lib/api-utils";
import { createAdSchema, listAdsSchema } from "@/lib/validations/ad";
import {
  createAd,
  listAds,
  getAdAnalytics,
  syncAdStatuses,
} from "@/lib/services/ad.service";
import { createRateLimiter } from "@/lib/rate-limit";

/** 10 ad creations per IP per minute */
const createLimiter = createRateLimiter({ windowMs: 60_000, max: 10 });

/** 60 reads per IP per minute */
const readLimiter = createRateLimiter({ windowMs: 60_000, max: 60 });

/**
 * POST /api/v1/ads
 * Admin-facing: create a new ad.
 *
 * Request body: CreateAdInput
 *
 * Success 201:
 *   { message: string, ad: IAd }
 */
export async function POST(request: NextRequest) {
  try {
    const csrfBlock = checkCsrfOrigin(request);
    if (csrfBlock) return csrfBlock;

    const ctBlock = checkJsonContentType(request);
    if (ctBlock) return ctBlock;

    const ip = getClientIp(request);
    const rateLimitBlock = checkRateLimit(createLimiter, ip);
    if (rateLimitBlock) return rateLimitBlock;

    const body = await request.json();
    const input = createAdSchema.parse(body);
    const ad = await createAd(input);

    return NextResponse.json(
      { message: "Ad created successfully", ad },
      { status: 201 },
    );
  } catch (error) {
    return handleApiError(error, "POST /api/v1/ads");
  }
}

/**
 * GET /api/v1/ads
 * Admin: list ads with pagination, status/placement filter, and search.
 *
 * Query params:
 *   status?    — one of the ad statuses or "all" (default "all")
 *   placement? — one of the ad placements or "all" (default "all")
 *   page?      — 1-based page number (default 1)
 *   limit?     — items per page, max 200 (default 20)
 *   search?    — search term
 *   analytics? — if "true", also return analytics summary
 *   sync?      — if "true", sync ad statuses before listing
 *
 * Success 200:
 *   { ads: IAd[], pagination: {...}, analytics?: AdAnalytics }
 */
export async function GET(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rateLimitBlock = checkRateLimit(readLimiter, ip);
    if (rateLimitBlock) return rateLimitBlock;

    const { searchParams } = new URL(request.url);

    // Optionally sync scheduled/expired statuses before listing
    if (searchParams.get("sync") === "true") {
      await syncAdStatuses();
    }

    const input = listAdsSchema.parse({
      status: searchParams.get("status") ?? undefined,
      placement: searchParams.get("placement") ?? undefined,
      page: searchParams.get("page") ?? undefined,
      limit: searchParams.get("limit") ?? 20,
      search: searchParams.get("search") ?? undefined,
    });

    const result = await listAds(input);

    // Optionally include analytics summary
    let analytics;
    if (searchParams.get("analytics") === "true") {
      analytics = await getAdAnalytics();
    }

    return NextResponse.json(
      { ...result, ...(analytics ? { analytics } : {}) },
      {
        headers: {
          "Cache-Control": "private, no-cache",
        },
      },
    );
  } catch (error) {
    return handleApiError(error, "GET /api/v1/ads");
  }
}

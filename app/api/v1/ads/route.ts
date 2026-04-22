import { NextRequest, NextResponse } from "next/server";
import { handleApiError, checkRateLimit, getClientIp } from "@/lib/api-utils";
import { listPublicAds } from "@/lib/services/ad.service";
import { createRateLimiter } from "@/lib/rate-limit";

/** 120 public reads per IP per minute */
const readLimiter = createRateLimiter({ windowMs: 60_000, max: 120 });

/**
 * GET /api/v1/ads
 * Public: list active ads for frontend display.
 *
 * Query params:
 *   placement? — one of the ad placements or "all" (default all)
 *   limit?     — items per request, max 50 (default 10)
 *
 * Success 200:
 *   { ads: IAd[] }
 */
export async function GET(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rateLimitBlock = checkRateLimit(readLimiter, ip);
    if (rateLimitBlock) return rateLimitBlock;

    const { searchParams } = new URL(request.url);

    const ads = await listPublicAds({
      placement: searchParams.get("placement") ?? undefined,
      limit: searchParams.get("limit")
        ? Number(searchParams.get("limit"))
        : undefined,
    });

    return NextResponse.json(
      { ads },
      {
        headers: {
          "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
        },
      },
    );
  } catch (error) {
    return handleApiError(error, "GET /api/v1/ads");
  }
}

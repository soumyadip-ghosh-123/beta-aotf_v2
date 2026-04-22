import { NextRequest, NextResponse } from "next/server";
import {
  handleApiError,
  checkRateLimit,
  getClientIp,
  checkJsonContentType,
} from "@/lib/api-utils";
import {
  getPublicAdByAdId,
  recordImpression,
  recordClick,
} from "@/lib/services/ad.service";
import { createRateLimiter } from "@/lib/rate-limit";
import { adIdParamSchema } from "@/lib/validations/api-route";

/** 120 reads per IP per minute */
const readLimiter = createRateLimiter({ windowMs: 60_000, max: 120 });

/** 60 tracking events per IP per minute */
const mutateLimiter = createRateLimiter({ windowMs: 60_000, max: 60 });

/**
 * GET /api/v1/ads/[adId]
 * Public: get a single active ad by its adId.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ adId: string }> },
) {
  try {
    const ip = getClientIp(request);
    const rateLimitBlock = checkRateLimit(readLimiter, ip);
    if (rateLimitBlock) return rateLimitBlock;

    const { adId } = adIdParamSchema.parse(await params);
    const ad = await getPublicAdByAdId(adId);

    return NextResponse.json(
      { ad },
      {
        headers: {
          "Cache-Control": "private, no-cache",
        },
      },
    );
  } catch (error) {
    return handleApiError(error, `GET /api/v1/ads/${(await params).adId}`);
  }
}

/**
 * PATCH /api/v1/ads/[adId]
 * Public: record analytics events only.
 *
 * Body:
 *   { _action: "impression" } — increment impressions counter
 *   { _action: "click" }      — increment clicks counter
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ adId: string }> },
) {
  try {
    const ctBlock = checkJsonContentType(request);
    if (ctBlock) return ctBlock;

    const ip = getClientIp(request);
    const rateLimitBlock = checkRateLimit(mutateLimiter, ip);
    if (rateLimitBlock) return rateLimitBlock;

    const { adId } = adIdParamSchema.parse(await params);
    const body = await request.json();

    if (body._action === "impression") {
      await recordImpression(adId);
      return NextResponse.json({ message: "Impression recorded" });
    }
    if (body._action === "click") {
      await recordClick(adId);
      return NextResponse.json({ message: "Click recorded" });
    }

    return NextResponse.json(
      { error: "Unsupported action" },
      { status: 400 },
    );
  } catch (error) {
    return handleApiError(error, `PATCH /api/v1/ads/${(await params).adId}`);
  }
}

import { NextRequest, NextResponse } from "next/server";
import {
  handleApiError,
  checkCsrfOrigin,
  checkRateLimit,
  getClientIp,
  checkJsonContentType,
} from "@/lib/api-utils";
import { updateAdSchema } from "@/lib/validations/ad";
import {
  getAdByAdId,
  updateAd,
  deleteAd,
  recordImpression,
  recordClick,
} from "@/lib/services/ad.service";
import { createRateLimiter } from "@/lib/rate-limit";
import { adIdParamSchema } from "@/lib/validations/api-route";

/** 60 reads per IP per minute */
const readLimiter = createRateLimiter({ windowMs: 60_000, max: 60 });

/** 20 mutations per IP per minute */
const mutateLimiter = createRateLimiter({ windowMs: 60_000, max: 20 });

/**
 * GET /api/v1/ads/[adId]
 * Get a single ad by its adId.
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
    const ad = await getAdByAdId(adId);

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
 * Admin-facing: update an ad.
 *
 * Special body keys:
 *   { _action: "impression" } — increment impressions counter
 *   { _action: "click" }      — increment clicks counter
 *   Otherwise                  — standard field update
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ adId: string }> },
) {
  try {
    const csrfBlock = checkCsrfOrigin(request);
    if (csrfBlock) return csrfBlock;

    const ctBlock = checkJsonContentType(request);
    if (ctBlock) return ctBlock;

    const ip = getClientIp(request);
    const rateLimitBlock = checkRateLimit(mutateLimiter, ip);
    if (rateLimitBlock) return rateLimitBlock;

    const { adId } = adIdParamSchema.parse(await params);
    const body = await request.json();

    // Handle analytics actions
    if (body._action === "impression") {
      await recordImpression(adId);
      return NextResponse.json({ message: "Impression recorded" });
    }
    if (body._action === "click") {
      await recordClick(adId);
      return NextResponse.json({ message: "Click recorded" });
    }

    // Standard update
    const input = updateAdSchema.parse(body);
    const ad = await updateAd(adId, input);

    return NextResponse.json({
      message: "Ad updated successfully",
      ad,
    });
  } catch (error) {
    return handleApiError(error, `PATCH /api/v1/ads/${(await params).adId}`);
  }
}

/**
 * DELETE /api/v1/ads/[adId]
 * Admin-facing: delete an ad.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ adId: string }> },
) {
  try {
    const csrfBlock = checkCsrfOrigin(request);
    if (csrfBlock) return csrfBlock;

    const ip = getClientIp(request);
    const rateLimitBlock = checkRateLimit(mutateLimiter, ip);
    if (rateLimitBlock) return rateLimitBlock;

    const { adId } = adIdParamSchema.parse(await params);
    await deleteAd(adId);

    return NextResponse.json({ message: "Ad deleted successfully" });
  } catch (error) {
    return handleApiError(error, `DELETE /api/v1/ads/${(await params).adId}`);
  }
}

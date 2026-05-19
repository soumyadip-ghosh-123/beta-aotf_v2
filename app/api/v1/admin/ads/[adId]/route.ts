import { auth } from "@clerk/nextjs/server";
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
import dbConnect from "@/lib/db";
import Admin from "@/lib/models/Admin";

/** 60 reads per IP per minute */
const readLimiter = createRateLimiter({ windowMs: 60_000, max: 60 });

/** 20 mutations per IP per minute */
const mutateLimiter = createRateLimiter({ windowMs: 60_000, max: 20 });

async function requireAdmin() {
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const metadata = sessionClaims?.publicMetadata as Record<string, unknown>;

  await dbConnect();
  const admin = await Admin.findOne({ clerkId: userId }).lean();
  if (!admin) {
    if (metadata?.isAdmin !== true) {
      return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
    }
    return { error: NextResponse.json({ error: "Admin not found" }, { status: 404 }) };
  }

  if (!admin.isActive || admin.isLocked) {
    return { error: NextResponse.json({ error: "Admin account is restricted" }, { status: 403 }) };
  }

  if (admin.role === "support_admin") {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return { admin };
}

/**
 * GET /api/v1/admin/ads/[adId]
 * Admin: get a single ad by its adId.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ adId: string }> },
) {
  try {
    const authResult = await requireAdmin();
    if (authResult.error) return authResult.error;

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
    return handleApiError(error, `GET /api/v1/admin/ads/${(await params).adId}`);
  }
}

/**
 * PATCH /api/v1/admin/ads/[adId]
 * Admin: update an ad or record analytics actions.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ adId: string }> },
) {
  try {
    const authResult = await requireAdmin();
    if (authResult.error) return authResult.error;

    const csrfBlock = checkCsrfOrigin(request);
    if (csrfBlock) return csrfBlock;

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

    const input = updateAdSchema.parse(body);
    const ad = await updateAd(adId, {
      ...input,
      updatedByAdminId: authResult.admin?._id.toString(),
    });

    return NextResponse.json({
      message: "Ad updated successfully",
      ad,
    });
  } catch (error) {
    return handleApiError(error, `PATCH /api/v1/admin/ads/${(await params).adId}`);
  }
}

/**
 * DELETE /api/v1/admin/ads/[adId]
 * Admin: delete an ad.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ adId: string }> },
) {
  try {
    const authResult = await requireAdmin();
    if (authResult.error) return authResult.error;

    const csrfBlock = checkCsrfOrigin(request);
    if (csrfBlock) return csrfBlock;

    const ip = getClientIp(request);
    const rateLimitBlock = checkRateLimit(mutateLimiter, ip);
    if (rateLimitBlock) return rateLimitBlock;

    const { adId } = adIdParamSchema.parse(await params);
    await deleteAd(adId);

    return NextResponse.json({ message: "Ad deleted successfully" });
  } catch (error) {
    return handleApiError(error, `DELETE /api/v1/admin/ads/${(await params).adId}`);
  }
}

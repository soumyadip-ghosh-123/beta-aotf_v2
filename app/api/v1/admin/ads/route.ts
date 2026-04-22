import { auth } from "@clerk/nextjs/server";
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
import dbConnect from "@/lib/db";
import Admin from "@/lib/models/Admin";

/** 10 ad creations per IP per minute */
const createLimiter = createRateLimiter({ windowMs: 60_000, max: 10 });

/** 60 reads per IP per minute */
const readLimiter = createRateLimiter({ windowMs: 60_000, max: 60 });

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

  if (admin.role === "moderator") {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return { admin };
}

/**
 * POST /api/v1/admin/ads
 * Admin-facing: create a new ad.
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAdmin();
    if (authResult.error) return authResult.error;

    const csrfBlock = checkCsrfOrigin(request);
    if (csrfBlock) return csrfBlock;

    const ctBlock = checkJsonContentType(request);
    if (ctBlock) return ctBlock;

    const ip = getClientIp(request);
    const rateLimitBlock = checkRateLimit(createLimiter, ip);
    if (rateLimitBlock) return rateLimitBlock;

    const body = await request.json();
    const input = createAdSchema.parse(body);
    const ad = await createAd({
      ...input,
      createdByAdminId: authResult.admin?._id.toString(),
    });

    return NextResponse.json(
      { message: "Ad created successfully", ad },
      { status: 201 },
    );
  } catch (error) {
    return handleApiError(error, "POST /api/v1/admin/ads");
  }
}

/**
 * GET /api/v1/admin/ads
 * Admin: list ads with pagination, status/placement filter, and search.
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdmin();
    if (authResult.error) return authResult.error;

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
    return handleApiError(error, "GET /api/v1/admin/ads");
  }
}

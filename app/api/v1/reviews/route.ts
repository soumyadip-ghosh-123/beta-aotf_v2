import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import {
  handleApiError,
  checkRateLimit,
  getClientIp,
  checkCsrfOrigin,
  checkJsonContentType,
} from "@/lib/api-utils";
import { createRateLimiter } from "@/lib/rate-limit";
import Admin from "@/lib/models/Admin";
import {
  createReviewSchema,
  listReviewsSchema,
} from "@/lib/validations/review";
import {
  createReviewAsAdmin,
  listAdminReviews,
  listPublicReviews,
} from "@/lib/services/review.service";

const readLimiter = createRateLimiter({ windowMs: 60_000, max: 120 });
const mutateLimiter = createRateLimiter({ windowMs: 60_000, max: 30 });

export async function GET(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rateLimitBlock = checkRateLimit(readLimiter, ip);
    if (rateLimitBlock) return rateLimitBlock;

    const { searchParams } = new URL(request.url);

    const publicOnly = searchParams.get("public") === "1";
    if (publicOnly) {
      const limitParam = searchParams.get("limit");
      const limit = limitParam ? Math.min(50, Math.max(1, Number(limitParam))) : 20;
      const reviews = await listPublicReviews(limit);
      return NextResponse.json({ reviews });
    }

    // Admin list
    const { userId, sessionClaims } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const metadata = sessionClaims?.publicMetadata as Record<string, unknown>;
    const isAdminFromMetadata = metadata?.isAdmin === true;

    const currentAdmin = await Admin.findOne({ clerkId: userId });

    if (!isAdminFromMetadata && !currentAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!currentAdmin) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    if (!currentAdmin.isActive || !currentAdmin.permissions.canManagePosts) {
      return NextResponse.json(
        { error: "You do not have permission to view reviews" },
        { status: 403 },
      );
    }

    const input = listReviewsSchema.parse({
      status: searchParams.get("status") ?? undefined,
      page: searchParams.get("page") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
    });

    const result = await listAdminReviews(input);
    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error, "GET /api/v1/reviews");
  }
}

export async function POST(request: NextRequest) {
  try {
    const csrfBlock = checkCsrfOrigin(request);
    if (csrfBlock) return csrfBlock;

    const ctBlock = checkJsonContentType(request);
    if (ctBlock) return ctBlock;

    const ip = getClientIp(request);
    const rateLimitBlock = checkRateLimit(mutateLimiter, ip);
    if (rateLimitBlock) return rateLimitBlock;

    const { userId, sessionClaims } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const metadata = sessionClaims?.publicMetadata as Record<string, unknown>;
    const isAdminFromMetadata = metadata?.isAdmin === true;

    const currentAdmin = await Admin.findOne({ clerkId: userId });

    if (!isAdminFromMetadata && !currentAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!currentAdmin) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    if (!currentAdmin.isActive || !currentAdmin.permissions.canManagePosts) {
      return NextResponse.json(
        { error: "You do not have permission to create reviews" },
        { status: 403 },
      );
    }

    const body = await request.json();
    const input = createReviewSchema.parse(body);

    const review = await createReviewAsAdmin(currentAdmin._id.toString(), input);
    return NextResponse.json({ message: "Review created", review }, { status: 201 });
  } catch (error) {
    return handleApiError(error, "POST /api/v1/reviews");
  }
}

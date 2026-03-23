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
import { reviewObjectIdSchema, updateReviewSchema } from "@/lib/validations/review";
import { deleteReviewAsAdmin, updateReviewAsAdmin } from "@/lib/services/review.service";

const mutateLimiter = createRateLimiter({ windowMs: 60_000, max: 30 });

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: RouteParams) {
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
        { error: "You do not have permission to update reviews" },
        { status: 403 },
      );
    }

    const { id } = await params;
    reviewObjectIdSchema.parse(id);

    const body = await request.json();
    const input = updateReviewSchema.parse(body);

    const review = await updateReviewAsAdmin(id, currentAdmin._id.toString(), input);
    return NextResponse.json({ message: "Review updated", review });
  } catch (error) {
    return handleApiError(error, "PATCH /api/v1/reviews/[id]");
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const csrfBlock = checkCsrfOrigin(request);
    if (csrfBlock) return csrfBlock;

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
        { error: "You do not have permission to delete reviews" },
        { status: 403 },
      );
    }

    const { id } = await params;
    reviewObjectIdSchema.parse(id);

    const result = await deleteReviewAsAdmin(id);
    return NextResponse.json({ message: "Review deleted", ...result });
  } catch (error) {
    return handleApiError(error, "DELETE /api/v1/reviews/[id]");
  }
}

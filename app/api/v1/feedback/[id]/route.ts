import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import {
  handleApiError,
  checkCsrfOrigin,
  checkRateLimit,
  getClientIp,
  checkJsonContentType,
} from "@/lib/api-utils";
import { createRateLimiter } from "@/lib/rate-limit";
import Admin from "@/lib/models/Admin";
import dbConnect from "@/lib/db";
import {
  feedbackObjectIdSchema,
  updateFeedbackSchema,
} from "@/lib/validations/feedback";
import { updateFeedback } from "@/lib/services/feedback.service";

const mutateLimiter = createRateLimiter({ windowMs: 60_000, max: 20 });

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
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const metadata = sessionClaims?.publicMetadata as Record<string, unknown>;
    const isAdminFromMetadata = metadata?.isAdmin === true;

    await dbConnect();
    const currentAdmin = await Admin.findOne({ clerkId: userId });

    // Match proxy behavior: accept DB-backed admin when Clerk metadata is stale.
    if (!isAdminFromMetadata && !currentAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!currentAdmin) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    if (
      !currentAdmin.isActive ||
      !currentAdmin.permissions.canHandleFeedbacks
    ) {
      return NextResponse.json(
        { error: "You do not have permission to update feedbacks" },
        { status: 403 },
      );
    }

    const { id } = await params;
    feedbackObjectIdSchema.parse(id);

    const body = await request.json();
    const input = updateFeedbackSchema.parse(body);
    const feedback = await updateFeedback(
      id,
      input,
      currentAdmin._id.toString(),
    );

    return NextResponse.json({
      message: "Feedback updated successfully",
      feedback,
    });
  } catch (error) {
    return handleApiError(error, "PATCH /api/v1/feedback/[id]");
  }
}

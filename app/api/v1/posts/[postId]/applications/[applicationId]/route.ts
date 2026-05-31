import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import {
  handleApiError,
  checkCsrfOrigin,
  checkRateLimit,
  getClientIp,
  checkJsonContentType,
} from "@/lib/api-utils";
import {
  getApplicationById,
  updateApplicationStatus,
  deleteApplicationsByIds,
} from "@/lib/services/application.service";
import { upsertPostLedger } from "@/lib/services/postLedger.service";
import { logActivity } from "@/lib/admin/logActivity";
import { createRateLimiter } from "@/lib/rate-limit";
import dbConnect from "@/lib/db";
import Admin from "@/lib/models/Admin";
import {
  postIdParamSchema,
  applicationIdParamSchema,
  updateApplicationStatusBodySchema,
} from "@/lib/validations/api-route";

const readLimiter = createRateLimiter({ windowMs: 60_000, max: 60 });
const writeLimiter = createRateLimiter({ windowMs: 60_000, max: 30 });

type RouteParams = {
  params: Promise<{ postId: string; applicationId: string }>;
};

/**
 * GET /api/v1/posts/[postId]/applications/[applicationId]
 * Get a single application by ID.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const resolvedParams = await params;
  try {
    const ip = getClientIp(request);
    const rateLimitBlock = checkRateLimit(readLimiter, ip);
    if (rateLimitBlock) return rateLimitBlock;

    postIdParamSchema.parse({ postId: resolvedParams.postId });
    const { applicationId } = applicationIdParamSchema.parse({
      applicationId: resolvedParams.applicationId,
    });

    const application = await getApplicationById(applicationId);
    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 },
      );
    }

    // Verify application belongs to this post
    if (application.postId !== resolvedParams.postId) {
      return NextResponse.json(
        { error: "Application not found for this post" },
        { status: 404 },
      );
    }

    return NextResponse.json({ application });
  } catch (error) {
    return handleApiError(
      error,
      `GET /api/v1/posts/${resolvedParams.postId}/applications/${resolvedParams.applicationId}`,
    );
  }
}

/**
 * PATCH /api/v1/posts/[postId]/applications/[applicationId]
 * Update application status (admin only).
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const resolvedParams = await params;
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const csrfBlock = checkCsrfOrigin(request);
    if (csrfBlock) return csrfBlock;

    const ip = getClientIp(request);
    const rateLimitBlock = checkRateLimit(writeLimiter, ip);
    if (rateLimitBlock) return rateLimitBlock;

    const contentTypeBlock = checkJsonContentType(request);
    if (contentTypeBlock) return contentTypeBlock;

    // Verify admin role
    await dbConnect();
    const adminUser = await Admin.findOne({ clerkId, isActive: true }).lean<{
      _id: mongoose.Types.ObjectId;
      role: string;
    }>();

    if (!adminUser) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 },
      );
    }

    postIdParamSchema.parse({ postId: resolvedParams.postId });
    const { applicationId } = applicationIdParamSchema.parse({
      applicationId: resolvedParams.applicationId,
    });

    const body = await request.json();
    const { status, reason, dcDate, gcDate, approvedAt, paymentDone, postPaymentDate } =
      updateApplicationStatusBodySchema.parse(body);

    // Verify application exists and belongs to this post
    const existingApplication = await getApplicationById(applicationId);
    if (!existingApplication) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 },
      );
    }

    if (existingApplication.postId !== resolvedParams.postId) {
      return NextResponse.json(
        { error: "Application not found for this post" },
        { status: 404 },
      );
    }

    console.log("[API Route] Before updateApplicationStatus call:", {
      applicationId,
      status,
      adminUserId: adminUser._id?.toString(),
      reason,
      dcDate: dcDate ? new Date(dcDate) : undefined,
      gcDate: gcDate ? new Date(gcDate) : undefined,
      paymentDone,
      postPaymentDate,
    });

    const updatedApplication = await updateApplicationStatus({
      applicationId,
      status,
      adminId: adminUser._id,
      reason,
      dcDate: dcDate ? new Date(dcDate) : undefined,
      gcDate: gcDate ? new Date(gcDate) : undefined,
      approvedAt: approvedAt ? new Date(approvedAt) : undefined,
      paymentDone,
      postPaymentDate: postPaymentDate ? new Date(postPaymentDate) : undefined,
    });

    console.log("[API Route] After updateApplicationStatus call:", {
      status: updatedApplication.status,
      dcDate: updatedApplication.dcDate,
      dcMeta: updatedApplication.dcMeta,
      gcMeta: updatedApplication.gcMeta,
    });

    // Trigger the ledger & sheet sync immediately upon application status change
    await upsertPostLedger(resolvedParams.postId);

    await logActivity({
      admin: adminUser as any, // Cast to any to bypass strict type since we have _id and role
      action: "UPDATE_APPLICATION_STATUS",
      module: "CRM",
      targetType: "Application",
      targetId: updatedApplication._id as mongoose.Types.ObjectId,
      targetRefId: resolvedParams.postId, // Hyperlink back to post
      metadata: {
        applicationId,
        postId: resolvedParams.postId,
        status: updatedApplication.status,
        reason,
      },
    });

    return NextResponse.json({
      message: "Application status updated successfully",
      application: updatedApplication,
    });
  } catch (error) {
    return handleApiError(
      error,
      `PATCH /api/v1/posts/${resolvedParams.postId}/applications/${resolvedParams.applicationId}`,
    );
  }
}

/**
 * DELETE /api/v1/posts/[postId]/applications/[applicationId]
 * Delete a single application (admin only).
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const resolvedParams = await params;
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const csrfBlock = checkCsrfOrigin(request);
    if (csrfBlock) return csrfBlock;

    const ip = getClientIp(request);
    const rateLimitBlock = checkRateLimit(writeLimiter, ip);
    if (rateLimitBlock) return rateLimitBlock;

    // Verify admin role
    await dbConnect();
    const adminUser = await Admin.findOne({ clerkId, isActive: true }).lean<{
      role: string;
    }>();

    if (!adminUser) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 },
      );
    }

    postIdParamSchema.parse({ postId: resolvedParams.postId });
    const { applicationId } = applicationIdParamSchema.parse({
      applicationId: resolvedParams.applicationId,
    });

    // Verify application exists and belongs to this post
    const existingApplication = await getApplicationById(applicationId);
    if (!existingApplication) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 },
      );
    }

    if (existingApplication.postId !== resolvedParams.postId) {
      return NextResponse.json(
        { error: "Application not found for this post" },
        { status: 404 },
      );
    }

    const deletedCount = await deleteApplicationsByIds([applicationId]);

    return NextResponse.json({
      message: "Application deleted successfully",
      deletedCount,
    });
  } catch (error) {
    return handleApiError(
      error,
      `DELETE /api/v1/posts/${resolvedParams.postId}/applications/${resolvedParams.applicationId}`,
    );
  }
}

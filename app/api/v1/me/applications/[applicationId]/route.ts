import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import {
  handleApiError,
  checkCsrfOrigin,
  checkRateLimit,
  getClientIp,
} from "@/lib/api-utils";
import {
  getApplicationById,
  getApplicantPermissionsByClerkId,
} from "@/lib/services/application.service";
import { createRateLimiter } from "@/lib/rate-limit";
import dbConnect from "@/lib/db";
import Application from "@/lib/models/Application";
import { applicationIdParamSchema } from "@/lib/validations/api-route";

const writeLimiter = createRateLimiter({ windowMs: 60_000, max: 30 });

type RouteParams = {
  params: Promise<{ applicationId: string }>;
};

/**
 * DELETE /api/v1/me/applications/[applicationId]
 * Withdraw own application (user only).
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

    const { applicationId } = applicationIdParamSchema.parse({
      applicationId: resolvedParams.applicationId,
    });

    await dbConnect();

    // Get user's permissions to get their applicantId
    const permissions = await getApplicantPermissionsByClerkId(clerkId);
    if (!permissions) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify application exists and belongs to this user
    const application = await getApplicationById(applicationId);
    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 },
      );
    }

    // Check ownership
    if (
      application.applicantId.toString() !== permissions.applicantId.toString()
    ) {
      return NextResponse.json(
        { error: "You can only withdraw your own applications" },
        { status: 403 },
      );
    }

    // Check if application can be withdrawn
    if (
      ["approved", "decline", "auto_declined", "withdrawn"].includes(
        application.status,
      )
    ) {
      return NextResponse.json(
        {
          error: `Cannot withdraw an application with status: ${application.status}`,
        },
        { status: 400 },
      );
    }

    // Update application status to withdrawn
    const updated = await Application.findOneAndUpdate(
      { applicationId },
      {
        $set: {
          status: "withdrawn",
          declineMeta: {
            reason: "Withdrawn by applicant",
            declinedAt: new Date(),
          },
        },
      },
      { new: true, runValidators: true },
    ).lean();

    return NextResponse.json({
      message: "Application withdrawn successfully",
      application: updated,
    });
  } catch (error) {
    return handleApiError(
      error,
      `DELETE /api/v1/me/applications/${resolvedParams.applicationId}`,
    );
  }
}

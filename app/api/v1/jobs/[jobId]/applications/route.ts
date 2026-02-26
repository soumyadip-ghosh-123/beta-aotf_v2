import { NextRequest, NextResponse } from "next/server";
import {
  handleApiError,
  checkCsrfOrigin,
  checkRateLimit,
  getClientIp,
} from "@/lib/api-utils";
import {
  getApplicationsByJobIdPublic,
  deleteAllApplicationsByJobIdPublic,
  deleteApplicationsByIds,
} from "@/lib/services/application.service";
import { createRateLimiter } from "@/lib/rate-limit";

/** 60 reads per IP per minute */
const readLimiter = createRateLimiter({ windowMs: 60_000, max: 60 });
const writeLimiter = createRateLimiter({ windowMs: 60_000, max: 30 });

/**
 * GET /api/v1/jobs/[jobId]/applications
 * Get all applications for a job post.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> },
) {
  try {
    const ip = getClientIp(request);
    const rateLimitBlock = checkRateLimit(readLimiter, ip);
    if (rateLimitBlock) return rateLimitBlock;

    const { jobId } = await params;
    const result = await getApplicationsByJobIdPublic(jobId);

    return NextResponse.json(
      { applications: result.applications, total: result.total },
      {
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
        },
      },
    );
  } catch (error) {
    return handleApiError(
      error,
      `GET /api/v1/jobs/${(await params).jobId}/applications`,
    );
  }
}

/**
 * DELETE /api/v1/jobs/[jobId]/applications
 *
 * Body (optional):
 *   { applicationIds?: string[] }
 *
 * - If `applicationIds` is provided, delete only those applications.
 * - If omitted / empty, delete ALL applications for the job.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> },
) {
  try {
    const csrfBlock = checkCsrfOrigin(request);
    if (csrfBlock) return csrfBlock;

    const ip = getClientIp(request);
    const rateLimitBlock = checkRateLimit(writeLimiter, ip);
    if (rateLimitBlock) return rateLimitBlock;

    const { jobId } = await params;
    const body = await request.json().catch(() => ({}));
    const applicationIds: string[] | undefined = body.applicationIds;

    let deletedCount: number;

    if (Array.isArray(applicationIds) && applicationIds.length > 0) {
      deletedCount = await deleteApplicationsByIds(applicationIds);
    } else {
      deletedCount = await deleteAllApplicationsByJobIdPublic(jobId);
    }

    return NextResponse.json({ deletedCount });
  } catch (error) {
    return handleApiError(
      error,
      `DELETE /api/v1/jobs/${(await params).jobId}/applications`,
    );
  }
}

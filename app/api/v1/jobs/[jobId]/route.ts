import { NextRequest, NextResponse } from "next/server";
import {
  handleApiError,
  checkCsrfOrigin,
  checkRateLimit,
  getClientIp,
} from "@/lib/api-utils";
import { updateJobSchema } from "@/lib/validations/job";
import {
  getJobByJobId,
  updateJob,
  deleteJob,
} from "@/lib/services/job.service";
import { createRateLimiter } from "@/lib/rate-limit";

/** 60 reads per IP per minute */
const readLimiter = createRateLimiter({ windowMs: 60_000, max: 60 });

/** 20 mutations per IP per minute */
const mutateLimiter = createRateLimiter({ windowMs: 60_000, max: 20 });

/**
 * GET /api/v1/jobs/[jobId]
 * Get a single job by its jobId.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> },
) {
  try {
    // Rate limit
    const ip = getClientIp(request);
    const rateLimitBlock = checkRateLimit(readLimiter, ip);
    if (rateLimitBlock) return rateLimitBlock;

    const { jobId } = await params;
    const job = await getJobByJobId(jobId);
    return NextResponse.json(
      { job },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      },
    );
  } catch (error) {
    return handleApiError(error, `GET /api/v1/jobs/${(await params).jobId}`);
  }
}

/**
 * PATCH /api/v1/jobs/[jobId]
 * Admin-facing: update a job.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> },
) {
  try {
    const csrfBlock = checkCsrfOrigin(request);
    if (csrfBlock) return csrfBlock;

    // Rate limit
    const ip = getClientIp(request);
    const rateLimitBlock = checkRateLimit(mutateLimiter, ip);
    if (rateLimitBlock) return rateLimitBlock;

    const { jobId } = await params;
    const body = await request.json();
    const input = updateJobSchema.parse(body);
    const job = await updateJob(jobId, input);

    return NextResponse.json({
      message: "Job updated successfully",
      job,
    });
  } catch (error) {
    return handleApiError(error, `PATCH /api/v1/jobs/${(await params).jobId}`);
  }
}

/**
 * DELETE /api/v1/jobs/[jobId]
 * Admin-facing: delete a job.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> },
) {
  try {
    const csrfBlock = checkCsrfOrigin(request);
    if (csrfBlock) return csrfBlock;

    // Rate limit
    const ipDel = getClientIp(request);
    const rateLimitBlockDel = checkRateLimit(mutateLimiter, ipDel);
    if (rateLimitBlockDel) return rateLimitBlockDel;

    const { jobId } = await params;
    await deleteJob(jobId);

    return NextResponse.json({ message: "Job deleted successfully" });
  } catch (error) {
    return handleApiError(error, `DELETE /api/v1/jobs/${(await params).jobId}`);
  }
}

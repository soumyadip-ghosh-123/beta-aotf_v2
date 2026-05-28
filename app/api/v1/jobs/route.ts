import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import {
  handleApiError,
  checkCsrfOrigin,
  checkRateLimit,
  getClientIp,
  checkJsonContentType,
} from "@/lib/api-utils";
import Admin from "@/lib/models/Admin";
import dbConnect from "@/lib/db";
import { createJobSchema, listJobsSchema } from "@/lib/validations/job";
import { createJob, listJobs } from "@/lib/services/job.service";
import { createRateLimiter } from "@/lib/rate-limit";

/** 10 job creations per IP per minute */
const createLimiter = createRateLimiter({ windowMs: 60_000, max: 10 });

/** 60 reads per IP per minute */
const readLimiter = createRateLimiter({ windowMs: 60_000, max: 60 });

/**
 * POST /api/v1/jobs
 * Admin-facing: create a new job post.
 *
 * Request body: CreateJobInput
 *
 * Success 201:
 *   { message: string, job: IJob }
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    // CSRF origin check
    const csrfBlock = checkCsrfOrigin(request);
    if (csrfBlock) return csrfBlock;

    // Content-Type check
    const ctBlock = checkJsonContentType(request);
    if (ctBlock) return ctBlock;

    // Rate limit
    const ip = getClientIp(request);
    const rateLimitBlock = checkRateLimit(createLimiter, ip);
    if (rateLimitBlock) return rateLimitBlock;

    await dbConnect();
    const currentAdmin = await Admin.findOne({ clerkId: userId }).lean();
    if (!currentAdmin) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 },
      );
    }

    const body = await request.json();
    const input = createJobSchema.parse(body);
    const job = await createJob({
      ...input,
      createdByAdminId: currentAdmin._id.toString(),
    });

    return NextResponse.json(
      { message: "Job created successfully", job },
      { status: 201 },
    );
  } catch (error) {
    return handleApiError(error, "POST /api/v1/jobs");
  }
}

/**
 * GET /api/v1/jobs
 * Public/Admin: list jobs with pagination, status filter, and search.
 *
 * Query params:
 *   status? — one of the job statuses or "all" (default "all")
 *   page?   — 1-based page number (default 1)
 *   limit?  — items per page, max 100 (default 20)
 *   search? — search term
 *
 * Success 200:
 *   { jobs: IJob[], pagination: { page, limit, total, totalPages } }
 */
export async function GET(request: NextRequest) {
  try {
    // Rate limit
    const ip = getClientIp(request);
    const rateLimitBlock = checkRateLimit(readLimiter, ip);
    if (rateLimitBlock) return rateLimitBlock;

    const { searchParams } = new URL(request.url);
    const input = listJobsSchema.parse({
      status: searchParams.get("status") ?? undefined,
      page: searchParams.get("page") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
      search: searchParams.get("search") ?? undefined,
    });

    const result = await listJobs(input);
    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    return handleApiError(error, "GET /api/v1/jobs");
  }
}

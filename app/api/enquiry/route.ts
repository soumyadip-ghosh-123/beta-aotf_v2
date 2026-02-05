import { NextRequest, NextResponse } from "next/server";
import {
  handleApiError,
  checkCsrfOrigin,
  checkRateLimit,
  getClientIp,
} from "@/lib/api-utils";
import {
  createEnquirySchema,
  listEnquiriesSchema,
} from "@/lib/validations/enquiry";
import { createEnquiry, listEnquiries } from "@/lib/services/enquiry.service";
import { createRateLimiter } from "@/lib/rate-limit";

/** 5 enquiry submissions per IP per minute */
const submitLimiter = createRateLimiter({ windowMs: 60_000, max: 5 });

/**
 * POST /api/enquiry
 * User-facing: submit a new enquiry.
 *
 * Request body:
 *   { name: string, phoneNumber: string, query: string }
 *
 * Success 201:
 *   { message: string, enquiryId: string }
 */
export async function POST(request: NextRequest) {
  try {
    // CSRF origin check
    const csrfBlock = checkCsrfOrigin(request);
    if (csrfBlock) return csrfBlock;

    // Rate limit
    const ip = getClientIp(request);
    const rateLimitBlock = checkRateLimit(submitLimiter, ip);
    if (rateLimitBlock) return rateLimitBlock;

    const body = await request.json();
    const input = createEnquirySchema.parse(body);
    const enquiryId = await createEnquiry(input);

    return NextResponse.json(
      { message: "Enquiry submitted successfully", enquiryId },
      { status: 201 },
    );
  } catch (error) {
    return handleApiError(error, "POST /api/enquiry");
  }
}

/**
 * GET /api/enquiry
 * Admin-facing: list enquiries with pagination & optional status filter.
 *
 * Query params:
 *   status? — one of the 6 statuses or "all" (default "all")
 *   page?   — 1-based page number (default 1)
 *   limit?  — items per page, max 100 (default 20)
 *
 * Success 200:
 *   { enquiries: EnrichedEnquiry[], pagination: { page, limit, total, totalPages } }
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const input = listEnquiriesSchema.parse({
      status: searchParams.get("status") ?? undefined,
      page: searchParams.get("page") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
    });

    const result = await listEnquiries(input);
    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error, "GET /api/enquiry");
  }
}

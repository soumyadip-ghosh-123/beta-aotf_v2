import { NextRequest, NextResponse } from "next/server";
import {
  handleApiError,
  checkCsrfOrigin,
  checkRateLimit,
  getClientIp,
} from "@/lib/api-utils";
import { updateStatusSchema, objectIdSchema } from "@/lib/validations/enquiry";
import {
  updateEnquiryStatus,
  getEnquiryStatusHistory,
} from "@/lib/services/enquiry.service";
import { createRateLimiter } from "@/lib/rate-limit";

/** 60 reads per IP per minute */
const readLimiter = createRateLimiter({ windowMs: 60_000, max: 60 });

/** 20 mutations per IP per minute */
const mutateLimiter = createRateLimiter({ windowMs: 60_000, max: 20 });

type RouteParams = { params: Promise<{ id: string }> };

/**
 * PATCH /api/v1/enquiry/[id]/status
 * Admin-facing: update an enquiry's status and create an audit trail record.
 *
 * Request body:
 *   { toStatus, action, notes?, adminId, adminName, adminRole }
 *
 * Success 200:
 *   { message, fromStatus, toStatus, attemptNumber }
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    // CSRF origin check
    const csrfBlock = checkCsrfOrigin(request);
    if (csrfBlock) return csrfBlock;

    // Rate limit
    const ip = getClientIp(request);
    const rateLimitBlock = checkRateLimit(mutateLimiter, ip);
    if (rateLimitBlock) return rateLimitBlock;

    const { id } = await params;
    objectIdSchema.parse(id);

    const body = await request.json();
    const input = updateStatusSchema.parse(body);

    const result = await updateEnquiryStatus(id, input);

    return NextResponse.json({
      message: "Status updated successfully",
      ...result,
    });
  } catch (error) {
    return handleApiError(error, "PATCH /api/v1/enquiry/[id]/status");
  }
}

/**
 * GET /api/v1/enquiry/[id]/status
 * Admin-facing: retrieve the full status-change history for an enquiry.
 *
 * Success 200:
 *   { statusHistory: IEnqStatus[] }
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Rate limit
    const ip = getClientIp(request);
    const rateLimitBlock = checkRateLimit(readLimiter, ip);
    if (rateLimitBlock) return rateLimitBlock;

    const { id } = await params;
    objectIdSchema.parse(id);

    const statusHistory = await getEnquiryStatusHistory(id);
    return NextResponse.json({ statusHistory });
  } catch (error) {
    return handleApiError(error, "GET /api/v1/enquiry/[id]/status");
  }
}

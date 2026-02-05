import { NextRequest, NextResponse } from "next/server";
import { handleApiError, checkCsrfOrigin } from "@/lib/api-utils";
import { updateStatusSchema, objectIdSchema } from "@/lib/validations/enquiry";
import {
  updateEnquiryStatus,
  getEnquiryStatusHistory,
} from "@/lib/services/enquiry.service";

type RouteParams = { params: Promise<{ id: string }> };

/**
 * PATCH /api/enquiry/[id]/status
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
    return handleApiError(error, "PATCH /api/enquiry/[id]/status");
  }
}

/**
 * GET /api/enquiry/[id]/status
 * Admin-facing: retrieve the full status-change history for an enquiry.
 *
 * Success 200:
 *   { statusHistory: IEnqStatus[] }
 */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    objectIdSchema.parse(id);

    const statusHistory = await getEnquiryStatusHistory(id);
    return NextResponse.json({ statusHistory });
  } catch (error) {
    return handleApiError(error, "GET /api/enquiry/[id]/status");
  }
}

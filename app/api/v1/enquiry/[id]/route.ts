import { NextRequest, NextResponse } from "next/server";
import { handleApiError, checkRateLimit, getClientIp } from "@/lib/api-utils";
import { createRateLimiter } from "@/lib/rate-limit";
import { getEnquiryById } from "@/lib/services/enquiry.service";
import { objectIdSchema } from "@/lib/validations/enquiry";

const readLimiter = createRateLimiter({ windowMs: 60_000, max: 60 });

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const ip = getClientIp(request);
    const rateLimitBlock = checkRateLimit(readLimiter, ip);
    if (rateLimitBlock) return rateLimitBlock;

    const { id } = await params;
    const enquiry = await getEnquiryById(objectIdSchema.parse(id));

    return NextResponse.json(
      { enquiry },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      },
    );
  } catch (error) {
    return handleApiError(error, "GET /api/v1/enquiry/[id]");
  }
}

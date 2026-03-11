import { NextRequest, NextResponse } from "next/server";
import {
  handleApiError,
  checkCsrfOrigin,
  checkRateLimit,
  getClientIp,
  checkJsonContentType,
} from "@/lib/api-utils";
import { createRenownedTeacherSchema } from "@/lib/validations/renowned-teacher";
import {
  listRenownedTeachers,
  createRenownedTeacher,
} from "@/lib/services/renowned-teacher.service";
import { createRateLimiter } from "@/lib/rate-limit";

const readLimiter = createRateLimiter({ windowMs: 60_000, max: 120 });
const mutateLimiter = createRateLimiter({ windowMs: 60_000, max: 20 });

/**
 * GET /api/v1/renowned-teachers
 * Public: list visible teachers (admin gets all via ?all=true)
 */
export async function GET(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rateLimitBlock = checkRateLimit(readLimiter, ip);
    if (rateLimitBlock) return rateLimitBlock;

    const { searchParams } = new URL(request.url);
    const visibleOnly = searchParams.get("all") !== "true";
    const teachers = await listRenownedTeachers(visibleOnly);

    return NextResponse.json(
      { teachers },
      { headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" } },
    );
  } catch (error) {
    return handleApiError(error, "GET /api/v1/renowned-teachers");
  }
}

/**
 * POST /api/v1/renowned-teachers
 * Admin-facing: create a new renowned teacher entry.
 */
export async function POST(request: NextRequest) {
  try {
    const csrfBlock = checkCsrfOrigin(request);
    if (csrfBlock) return csrfBlock;

    const ctBlock = checkJsonContentType(request);
    if (ctBlock) return ctBlock;

    const ip = getClientIp(request);
    const rateLimitBlock = checkRateLimit(mutateLimiter, ip);
    if (rateLimitBlock) return rateLimitBlock;

    const body = await request.json();
    const input = createRenownedTeacherSchema.parse(body);
    const teacher = await createRenownedTeacher(input);

    return NextResponse.json(
      { message: "Renowned teacher created successfully", teacher },
      { status: 201 },
    );
  } catch (error) {
    return handleApiError(error, "POST /api/v1/renowned-teachers");
  }
}

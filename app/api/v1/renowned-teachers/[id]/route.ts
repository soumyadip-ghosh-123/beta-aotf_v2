import { NextRequest, NextResponse } from "next/server";
import {
  handleApiError,
  checkCsrfOrigin,
  checkRateLimit,
  getClientIp,
  checkJsonContentType,
} from "@/lib/api-utils";
import { updateRenownedTeacherSchema } from "@/lib/validations/renowned-teacher";
import {
  getRenownedTeacherById,
  updateRenownedTeacher,
  deleteRenownedTeacher,
} from "@/lib/services/renowned-teacher.service";
import { logActivity } from "@/lib/admin/logActivity";
import { auth } from "@clerk/nextjs/server";
import Admin from "@/lib/models/Admin";
import { createRateLimiter } from "@/lib/rate-limit";

const readLimiter = createRateLimiter({ windowMs: 60_000, max: 60 });
const mutateLimiter = createRateLimiter({ windowMs: 60_000, max: 20 });

/** GET /api/v1/renowned-teachers/[id] */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const ip = getClientIp(request);
    const rateLimitBlock = checkRateLimit(readLimiter, ip);
    if (rateLimitBlock) return rateLimitBlock;

    const { id } = await params;
    const teacher = await getRenownedTeacherById(id);
    return NextResponse.json({ teacher });
  } catch (error) {
    return handleApiError(error, `GET /api/v1/renowned-teachers/${(await params).id}`);
  }
}

/** PATCH /api/v1/renowned-teachers/[id] */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const csrfBlock = checkCsrfOrigin(request);
    if (csrfBlock) return csrfBlock;

    const ctBlock = checkJsonContentType(request);
    if (ctBlock) return ctBlock;

    const ip = getClientIp(request);
    const rateLimitBlock = checkRateLimit(mutateLimiter, ip);
    if (rateLimitBlock) return rateLimitBlock;

    const { id } = await params;
    const body = await request.json();
    const input = updateRenownedTeacherSchema.parse(body);
    const teacher = await updateRenownedTeacher(id, input);

    const { userId } = await auth();
    if (userId) {
      const currentAdmin = await Admin.findOne({ clerkId: userId }).lean();
      if (currentAdmin) {
        await logActivity({
          admin: currentAdmin as any,
          action: "UPDATE_RENOWNED_TEACHER",
          module: "CRM",
          targetType: "RenownedTeacher",
          targetId: teacher._id as any,
          targetSnapshot: {
            name: teacher.name,
            designation: teacher.designation,
          },
        });
      }
    }

    return NextResponse.json({ message: "Updated successfully", teacher });
  } catch (error) {
    return handleApiError(error, `PATCH /api/v1/renowned-teachers/${(await params).id}`);
  }
}

/** DELETE /api/v1/renowned-teachers/[id] */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const csrfBlock = checkCsrfOrigin(request);
    if (csrfBlock) return csrfBlock;

    const ip = getClientIp(request);
    const rateLimitBlock = checkRateLimit(mutateLimiter, ip);
    if (rateLimitBlock) return rateLimitBlock;

    const { id } = await params;
    const teacher = await getRenownedTeacherById(id);
    await deleteRenownedTeacher(id);

    const { userId } = await auth();
    if (userId && teacher) {
      const currentAdmin = await Admin.findOne({ clerkId: userId }).lean();
      if (currentAdmin) {
        await logActivity({
          admin: currentAdmin as any,
          action: "DELETE_RENOWNED_TEACHER",
          module: "CRM",
          targetType: "RenownedTeacher",
          targetId: teacher._id as any,
          targetSnapshot: { name: teacher.name },
        });
      }
    }

    return NextResponse.json({ message: "Deleted successfully" });
  } catch (error) {
    return handleApiError(error, `DELETE /api/v1/renowned-teachers/${(await params).id}`);
  }
}

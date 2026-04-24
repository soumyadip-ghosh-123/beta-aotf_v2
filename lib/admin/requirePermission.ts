import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import AdminRole from "@/lib/models/admin/AdminRole";
import AdminUser from "@/lib/models/admin/AdminUser";
import type { Permission } from "@/lib/admin/permissions";
import type { IAdminUser } from "@/lib/models/admin/AdminUser";

type PermissionResult = {
  admin: IAdminUser | null;
  error?: NextResponse;
};

export function requirePermission(...required: Permission[]) {
  return async function permissionGuard(_req: Request): Promise<PermissionResult> {
    await dbConnect();
    const { userId } = await auth();

    if (!userId) {
      return {
        admin: null,
        error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
      };
    }

    const admin = await AdminUser.findOne({ clerkUserId: userId });
    if (!admin || admin.status !== "ACTIVE") {
      return {
        admin: null,
        error: NextResponse.json(
          { error: "Forbidden: admin not active" },
          { status: 403 },
        ),
      };
    }

    if (required.length === 0) {
      return { admin };
    }

    const role = await AdminRole.findOne({ name: admin.role }).lean();
    const rolePermissions = role?.permissions ?? [];
    const hasAll = required.every((perm) => rolePermissions.includes(perm));

    if (!hasAll) {
      return {
        admin: null,
        error: NextResponse.json(
          { error: "Insufficient permissions", required },
          { status: 403 },
        ),
      };
    }

    return { admin };
  };
}

export async function getAdminFromRequest(_req: Request) {
  await dbConnect();
  const { userId } = await auth();
  if (!userId) return null;
  return await AdminUser.findOne({ clerkUserId: userId });
}

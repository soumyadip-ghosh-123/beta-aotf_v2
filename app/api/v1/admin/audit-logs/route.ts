import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import * as adminService from "@/lib/services/admin.service";
import Admin from "@/lib/models/Admin";
import dbConnect from "@/lib/db";

/**
 * GET /api/v1/admin/audit-logs - Get audit logs
 */
export async function GET(req: NextRequest) {
  try {
    const { userId, sessionClaims } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const metadata = sessionClaims?.publicMetadata as Record<string, unknown>;

    if (metadata?.isAdmin !== true) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await dbConnect();

    const currentAdmin = await Admin.findOne({ clerkId: userId });

    if (!currentAdmin) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    // Check permissions
    if (
      !currentAdmin.permissions.canViewAuditLogs &&
      currentAdmin.role !== "super_admin"
    ) {
      return NextResponse.json(
        { error: "You don't have permission to view audit logs" },
        { status: 403 },
      );
    }

    const { searchParams } = new URL(req.url);
    const adminId = searchParams.get("adminId") || undefined;
    const action = searchParams.get("action") || undefined;
    const targetType = searchParams.get("targetType") || undefined;
    const limit = parseInt(searchParams.get("limit") || "100");
    const skip = parseInt(searchParams.get("skip") || "0");

    const result = await adminService.getAuditLogs({
      adminId,
      action,
      targetType,
      limit,
      skip,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("[GET /api/v1/admin/audit-logs] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

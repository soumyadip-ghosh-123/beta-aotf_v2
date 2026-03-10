import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import * as adminService from "@/lib/services/admin.service";
import Admin from "@/lib/models/Admin";
import dbConnect from "@/lib/db";

/**
 * POST /api/v1/admin/admins - Create new admin
 */
export async function POST(req: NextRequest) {
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

    // Get current admin
    const currentAdmin = await Admin.findOne({ clerkId: userId });

    if (!currentAdmin) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    // Only super_admin can create admins
    if (currentAdmin.role !== "super_admin") {
      return NextResponse.json(
        { error: "Only superadmin can create admins" },
        { status: 403 },
      );
    }

    if (!currentAdmin.isActive) {
      return NextResponse.json(
        { error: "Admin account is deactivated" },
        { status: 403 },
      );
    }

    const body = await req.json();
    const { username, email, firstName, lastName, role } = body;

    // Validate input
    if (!username || !email || !firstName || !role) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    if (!["admin", "moderator"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const result = await adminService.createAdmin({
      username,
      email,
      firstName,
      lastName,
      role,
      creatorAdminId: currentAdmin._id.toString(),
      creatorClerkId: currentAdmin.clerkId,
      creatorUsername: currentAdmin.username,
      ipAddress:
        req.headers.get("x-forwarded-for") ||
        req.headers.get("x-real-ip") ||
        undefined,
      userAgent: req.headers.get("user-agent") || undefined,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("[POST /api/v1/admin/admins] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * GET /api/v1/admin/admins - Get all admins
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

    // Get current admin
    const currentAdmin = await Admin.findOne({ clerkId: userId });

    if (!currentAdmin) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    // Check if admin has permission to view admins
    if (
      !currentAdmin.permissions.canViewAuditLogs &&
      currentAdmin.role !== "super_admin"
    ) {
      return NextResponse.json(
        { error: "You don't have permission to view admins" },
        { status: 403 },
      );
    }

    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role") || undefined;
    const isActive = searchParams.get("isActive");
    const isLocked = searchParams.get("isLocked");

    const result = await adminService.getAdmins({
      role,
      isActive: isActive ? isActive === "true" : undefined,
      isLocked: isLocked ? isLocked === "true" : undefined,
    });

    // Sub-superadmins can only see support admins (moderators)
    if (currentAdmin.role === "admin") {
      result.admins = result.admins.filter(
        (admin) => admin.role === "moderator",
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("[GET /api/v1/admin/admins] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

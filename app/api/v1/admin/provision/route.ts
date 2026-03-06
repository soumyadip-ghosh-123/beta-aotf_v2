import { auth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import crypto from "crypto";
import dbConnect from "@/lib/db";
import Admin from "@/lib/models/Admin";

export async function POST(req: Request) {
  try {
    const { userId: clerkId, sessionClaims } = await auth();
    if (!clerkId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const meta = sessionClaims?.publicMetadata as
      | Record<string, unknown>
      | undefined;
    if (meta?.isAdmin !== true) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 },
      );
    }

    await dbConnect();

    // Verify the requesting admin has canManageAdmins permission
    const requestingAdmin = await Admin.findOne({ clerkId, isActive: true });
    if (!requestingAdmin || !requestingAdmin.permissions.canManageAdmins) {
      return NextResponse.json(
        { error: "Insufficient permissions: canManageAdmins required" },
        { status: 403 },
      );
    }

    const body = await req.json();
    const { email, name, role, permissions } = body as {
      email: string;
      name: string;
      role: "super_admin" | "admin" | "moderator";
      permissions: {
        canManageUsers?: boolean;
        canManagePosts?: boolean;
        canManageJobs?: boolean;
        canProcessRefunds?: boolean;
        canViewAnalytics?: boolean;
        canManageAdmins?: boolean;
      };
    };

    if (!email || !name || !role) {
      return NextResponse.json(
        { error: "email, name, and role are required" },
        { status: 400 },
      );
    }

    if (!["super_admin", "admin", "moderator"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Generate a secure temporary password
    const tempPassword = crypto.randomBytes(12).toString("base64url") + "!A1";

    // Create Clerk user
    const client = await clerkClient();
    const newClerkUser = await client.users.createUser({
      emailAddress: [email],
      password: tempPassword,
    });

    // Create admin doc in MongoDB
    const admin = await Admin.create({
      clerkId: newClerkUser.id,
      name,
      role,
      permissions: permissions ?? {},
      isActive: true,
      createdBy: requestingAdmin._id,
    });

    // Set admin metadata in Clerk
    await client.users.updateUserMetadata(newClerkUser.id, {
      publicMetadata: {
        isAdmin: true,
        role,
        permissions: admin.permissions,
      },
    });

    console.log(
      `[admin-provision] Admin ${name} (${email}) provisioned by ${clerkId}`,
    );

    return NextResponse.json({
      success: true,
      adminId: admin._id,
      tempPassword,
    });
  } catch (error) {
    console.error("[admin-provision] Error:", error);

    // Handle Clerk API errors (e.g., email already exists)
    if (typeof error === "object" && error !== null && "clerkError" in error) {
      return NextResponse.json(
        { error: "Failed to create Clerk user. Email may already be in use." },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { error: "Failed to provision admin" },
      { status: 500 },
    );
  }
}

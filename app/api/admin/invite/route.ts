import { handleApiError } from "@/lib/api-utils";
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/db";
import { PERMISSIONS } from "@/lib/admin/permissions";
import { canActorManageRole } from "@/lib/admin/hierarchyCheck";
import { logActivity } from "@/lib/admin/logActivity";
import { requirePermission } from "@/lib/admin/requirePermission";
import AdminInvite from "@/lib/models/admin/AdminInvite";
import AdminRole from "@/lib/models/admin/AdminRole";
import AdminUser from "@/lib/models/admin/AdminUser";
import { sendAdminInviteEmail } from "@/lib/services/email.service";

const INVITE_EXPIRY_HOURS = 72;

export async function POST(req: Request) {
  await dbConnect();
  const permissionCheck = await requirePermission(PERMISSIONS.ADMIN_INVITE)(req);
  if (permissionCheck.error || !permissionCheck.admin) {
    return (
      permissionCheck.error ??
      NextResponse.json({ error: "Forbidden" }, { status: 403 })
    );
  }

  const actor = permissionCheck.admin;

  try {
    const body = (await req.json()) as {
      email?: string;
      assignedRole?: string;
      name?: string;
    };
    const email = body.email?.trim().toLowerCase();
    const assignedRole = body.assignedRole?.trim();
    const name = body.name?.trim();

    if (!email || !assignedRole || !name) {
      return NextResponse.json(
        { error: "email, assignedRole and name are required" },
        { status: 400 },
      );
    }

    const roleDoc = await AdminRole.findOne({ name: assignedRole }).lean();
    if (!roleDoc) {
      return NextResponse.json({ error: "Assigned role not found" }, { status: 400 });
    }

    const canManageAssignedRole = await canActorManageRole(actor.role, assignedRole);
    if (!canManageAssignedRole) {
      return NextResponse.json(
        { error: "Hierarchy violation: cannot invite this role" },
        { status: 403 },
      );
    }

    const existingAdmin = await AdminUser.findOne({ email }).lean();
    const blockedStatuses = new Set(["ACTIVE", "SUSPENDED", "INVITED"]);

    if (existingAdmin && blockedStatuses.has(existingAdmin.status)) {
      return NextResponse.json(
        { error: "Admin with this email already exists" },
        { status: 409 },
      );
    }

    const pendingInvite = await AdminInvite.findOne({ email, status: "PENDING" }).lean();
    if (pendingInvite) {
      return NextResponse.json(
        { error: "Pending invite already exists for this email" },
        { status: 409 },
      );
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + INVITE_EXPIRY_HOURS * 60 * 60 * 1000);
    const token = crypto.randomUUID();

    const invite = await AdminInvite.create({
      token,
      email,
      assignedRole,
      invitedBy: actor._id,
      inviteeName: name,
      status: "PENDING",
      expiresAt,
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://aotf.in";
    const joinLink = `${appUrl}/admin/join?token=${token}`;

    await sendAdminInviteEmail({
      email,
      inviteeName: name,
      inviterName: actor.name,
      assignedRoleDisplayName: roleDoc.displayName,
      joinLink,
      expiresAt,
    });

    // ACTIVITY LOG
    await logActivity({
      admin: actor,
      action: PERMISSIONS.ADMIN_INVITE,
      module: "ADMIN_MGMT",
      targetType: "AdminInvite",
      targetId: invite._id as mongoose.Types.ObjectId,
      before: null,
      after: invite.toObject(),
      targetSnapshot: { email, assignedRole, inviteeName: name },
      metadata: {
        ipAddress: req.headers.get("x-forwarded-for") ?? undefined,
        userAgent: req.headers.get("user-agent") ?? undefined,
      },
    });

    return NextResponse.json({ success: true, inviteId: invite._id.toString() });
  } catch (error) {
    return handleApiError(error, "POST /api/admin/invite", { legacyAdminShape: true });
  }
}

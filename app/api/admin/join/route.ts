import { handleApiError } from "@/lib/api-utils";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/db";
import { PERMISSIONS } from "@/lib/admin/permissions";
import { logActivity } from "@/lib/admin/logActivity";
import AdminInvite from "@/lib/models/admin/AdminInvite";
import AdminUser from "@/lib/models/admin/AdminUser";

async function resolveInvite(token: string) {
  const invite = await AdminInvite.findOne({ token });
  if (!invite) return { code: 404 as const, error: "Invite not found" };

  if (invite.status !== "PENDING") {
    return {
      code: 410 as const,
      error: `Invite is no longer valid: ${invite.status}`,
    };
  }

  if (invite.expiresAt.getTime() < Date.now()) {
    invite.status = "EXPIRED";
    await invite.save();
    return { code: 410 as const, error: "Invite has expired" };
  }

  return { invite };
}

export async function GET(req: Request) {
  await dbConnect();
  const url = new URL(req.url);
  const token = url.searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  const inviteResult = await resolveInvite(token);
  if ("error" in inviteResult) {
    return NextResponse.json({ error: inviteResult.error }, { status: inviteResult.code });
  }

  const inviter = await AdminUser.findById(inviteResult.invite.invitedBy).lean();

  return NextResponse.json({
    email: inviteResult.invite.email,
    assignedRole: inviteResult.invite.assignedRole,
    inviterName: inviter?.name ?? "AOTF Admin",
    expiresAt: inviteResult.invite.expiresAt,
    inviteeName: inviteResult.invite.inviteeName,
  });
}

export async function POST(req: Request) {
  await dbConnect();

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await req.json()) as { token?: string; clerkUserId?: string };
    if (!body.token || !body.clerkUserId) {
      return NextResponse.json(
        { error: "token and clerkUserId are required" },
        { status: 400 },
      );
    }

    if (body.clerkUserId !== userId) {
      return NextResponse.json(
        { error: "clerkUserId does not match current session" },
        { status: 403 },
      );
    }

    const inviteResult = await resolveInvite(body.token);
    if ("error" in inviteResult) {
      return NextResponse.json(
        { error: inviteResult.error },
        { status: inviteResult.code },
      );
    }

    const client = await clerkClient();
    const clerkUser = await client.users.getUser(body.clerkUserId);
    const primaryEmail =
      clerkUser.emailAddresses.find((email) => email.id === clerkUser.primaryEmailAddressId)
        ?.emailAddress ?? clerkUser.emailAddresses[0]?.emailAddress;

    if (!primaryEmail) {
      return NextResponse.json(
        { error: "No primary email found for Clerk user" },
        { status: 400 },
      );
    }

    if (primaryEmail.toLowerCase() !== inviteResult.invite.email.toLowerCase()) {
      return NextResponse.json(
        { error: "Invite email does not match signed in user email" },
        { status: 400 },
      );
    }

    const existing = await AdminUser.findOne({ clerkUserId: body.clerkUserId }).lean();
    if (existing) {
      return NextResponse.json(
        { error: "Admin profile already exists for this Clerk user" },
        { status: 409 },
      );
    }

    const invitedBy = await AdminUser.findById(inviteResult.invite.invitedBy);
    if (!invitedBy) {
      return NextResponse.json({ error: "Inviter admin not found" }, { status: 400 });
    }

    const adminUser = await AdminUser.create({
      clerkUserId: body.clerkUserId,
      email: inviteResult.invite.email,
      name: inviteResult.invite.inviteeName,
      role: inviteResult.invite.assignedRole,
      status: "ACTIVE",
      invitedBy: invitedBy._id,
      invitedAt: inviteResult.invite.createdAt,
      activatedAt: new Date(),
    });

    await client.users.updateUserMetadata(body.clerkUserId, {
      publicMetadata: { aotfRole: inviteResult.invite.assignedRole },
    });

    inviteResult.invite.status = "ACCEPTED";
    inviteResult.invite.acceptedAt = new Date();
    await inviteResult.invite.save();

    // ACTIVITY LOG
    await logActivity({
      admin: invitedBy,
      action: PERMISSIONS.ADMIN_ROLE_CHANGE,
      module: "ADMIN_MGMT",
      targetType: "AdminUser",
      targetId: adminUser._id as mongoose.Types.ObjectId,
      before: null,
      after: { role: inviteResult.invite.assignedRole },
      targetSnapshot: { email: adminUser.email, name: adminUser.name },
      metadata: {
        event: "initial_role_assignment",
        ipAddress: req.headers.get("x-forwarded-for") ?? undefined,
        userAgent: req.headers.get("user-agent") ?? undefined,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error, "POST /api/admin/join", { legacyAdminShape: true });
  }
}

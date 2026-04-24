import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { PERMISSIONS } from "@/lib/admin/permissions";
import { getRoleLevel } from "@/lib/admin/hierarchyCheck";
import { requirePermission } from "@/lib/admin/requirePermission";
import AdminUser from "@/lib/models/admin/AdminUser";

export async function GET(req: Request) {
  await dbConnect();
  const permissionCheck = await requirePermission(PERMISSIONS.ADMIN_VIEW_METRICS)(req);
  if (permissionCheck.error || !permissionCheck.admin) {
    return (
      permissionCheck.error ??
      NextResponse.json({ error: "Forbidden" }, { status: 403 })
    );
  }

  const actor = permissionCheck.admin;
  const actorLevel = await getRoleLevel(actor.role);
  if (actorLevel === null) {
    return NextResponse.json({ error: "Actor role not found" }, { status: 500 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const role = searchParams.get("role");

  const query: Record<string, unknown> = {};
  if (status) query.status = status;
  if (role) query.role = role;

  const users = await AdminUser.find(query)
    .populate("invitedBy", "name role")
    .sort({ createdAt: -1 })
    .lean();

  if (actor.role === "FOUNDER") {
    return NextResponse.json({ users });
  }

  const visibleUsers = [];
  for (const user of users) {
    const level = await getRoleLevel(user.role);
    if (level !== null && actorLevel < level) {
      visibleUsers.push(user);
    }
  }

  return NextResponse.json({ users: visibleUsers });
}

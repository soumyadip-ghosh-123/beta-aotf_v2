import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/db";
import { getRoleLevel } from "@/lib/admin/hierarchyCheck";
import { PERMISSIONS } from "@/lib/admin/permissions";
import { requirePermission } from "@/lib/admin/requirePermission";
import AdminActivityLog from "@/lib/models/admin/AdminActivityLog";
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
    return NextResponse.json({ error: "Actor role missing" }, { status: 500 });
  }

  const { searchParams } = new URL(req.url);
  const adminId = searchParams.get("adminId") ?? actor._id.toString();
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const module = searchParams.get("module");

  if (!from || !to) {
    return NextResponse.json({ error: "from and to are required" }, { status: 400 });
  }

  if (!mongoose.Types.ObjectId.isValid(adminId)) {
    return NextResponse.json({ error: "Invalid adminId" }, { status: 400 });
  }

  const targetAdmin = await AdminUser.findById(adminId).lean();
  if (!targetAdmin) {
    return NextResponse.json({ error: "Admin not found" }, { status: 404 });
  }

  const targetLevel = await getRoleLevel(targetAdmin.role);
  if (targetLevel === null) {
    return NextResponse.json({ error: "Target role missing" }, { status: 500 });
  }

  const isSelf = actor._id.toString() === targetAdmin._id.toString();
  const canViewOther = actorLevel < targetLevel;
  if (!isSelf && !canViewOther) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const matchStage: Record<string, unknown> = {
    adminId: new mongoose.Types.ObjectId(adminId),
    createdAt: { $gte: new Date(from), $lte: new Date(to) },
  };
  if (module) {
    matchStage.module = module;
  }

  const aggregate = await AdminActivityLog.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: { module: "$module", action: "$action" },
        count: { $sum: 1 },
        lastPerformed: { $max: "$createdAt" },
      },
    },
    {
      $group: {
        _id: "$_id.module",
        actions: {
          $push: {
            action: "$_id.action",
            count: "$count",
            lastPerformed: "$lastPerformed",
          },
        },
        totalActions: { $sum: "$count" },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const totalActions = aggregate.reduce(
    (acc, group) => acc + (group.totalActions as number),
    0,
  );

  return NextResponse.json({
    adminId: targetAdmin._id.toString(),
    adminName: targetAdmin.name,
    adminRole: targetAdmin.role,
    period: { from, to },
    summary: {
      totalActions,
      byModule: aggregate.map((group) => ({
        module: group._id,
        totalActions: group.totalActions,
        actions: group.actions.map(
          (action: { action: string; count: number; lastPerformed: Date }) => ({
            action: action.action,
            count: action.count,
            lastPerformed: new Date(action.lastPerformed).toISOString(),
          }),
        ),
      })),
    },
  });
}

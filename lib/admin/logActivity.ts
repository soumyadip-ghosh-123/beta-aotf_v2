import mongoose from "mongoose";
import AdminActivityLog, {
  type IAdminActivityLog,
} from "@/lib/models/admin/AdminActivityLog";
import type { IAdminUser } from "@/lib/models/admin/AdminUser";

interface LogActivityParams {
  admin: IAdminUser;
  action: string;
  module: IAdminActivityLog["module"];
  targetType: string;
  targetId: mongoose.Types.ObjectId;
  before?: unknown;
  after?: unknown;
  metadata?: Record<string, unknown>;
  targetSnapshot?: unknown;
}

export async function logActivity(params: LogActivityParams): Promise<void> {
  try {
    const {
      admin,
      action,
      module,
      targetType,
      targetId,
      before = null,
      after = null,
      metadata,
      targetSnapshot,
    } = params;

    await AdminActivityLog.create({
      adminId: admin._id,
      adminRole: admin.role,
      action,
      module,
      targetType,
      targetId,
      targetSnapshot: targetSnapshot ?? null,
      diff: {
        before,
        after,
      },
      metadata: metadata ?? {},
    });
  } catch (error) {
    console.error("[logActivity] Failed to write admin activity log:", error);
  }
}

export type { LogActivityParams };

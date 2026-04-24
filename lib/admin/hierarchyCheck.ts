import AdminRole from "@/lib/models/admin/AdminRole";
import type { IAdminUser } from "@/lib/models/admin/AdminUser";

export async function getRoleLevel(roleName: string): Promise<number | null> {
  const role = await AdminRole.findOne({ name: roleName }).lean();
  return role?.level ?? null;
}

export async function canActorManageRole(
  actorRoleName: string,
  targetRoleName: string,
): Promise<boolean> {
  const [actorLevel, targetLevel] = await Promise.all([
    getRoleLevel(actorRoleName),
    getRoleLevel(targetRoleName),
  ]);

  if (actorLevel === null || targetLevel === null) return false;
  return actorLevel < targetLevel;
}

export async function canActorManageAdmin(
  actor: Pick<IAdminUser, "role">,
  target: Pick<IAdminUser, "role">,
): Promise<boolean> {
  return canActorManageRole(actor.role, target.role);
}


const ADMIN_ROLES = new Set([
  "super_admin",
  "admin",
  "support_admin",
  "crm",
  "moderator",
]);

/** Clerk publicMetadata flags used by admin accounts (not teachers). */
export function isClerkAdmin(
  metadata: Record<string, unknown> | undefined,
): boolean {
  if (!metadata) return false;
  if (metadata.isAdmin === true) return true;
  if (metadata.permissions && typeof metadata.permissions === "object") {
    return true;
  }
  if (typeof metadata.aotfRole === "string" && metadata.aotfRole.length > 0) {
    return true;
  }
  const role = metadata.role;
  return typeof role === "string" && ADMIN_ROLES.has(role);
}

/** Any Clerk user that should be mirrored into the app User collection. */
export function isAppClerkUser(clerkUser: {
  publicMetadata?: Record<string, unknown> | null;
}): boolean {
  return !isClerkAdmin(
    clerkUser.publicMetadata as Record<string, unknown> | undefined,
  );
}

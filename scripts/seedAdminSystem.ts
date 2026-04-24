import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../.env.local") });

async function upsertRole(
  AdminRoleModel: {
    findOneAndUpdate: (
      filter: Record<string, unknown>,
      update: Record<string, unknown>,
      options: Record<string, unknown>,
    ) => Promise<unknown>;
  },
  name: string,
  displayName: string,
  level: number,
  permissions: string[],
) {
  const role = await AdminRoleModel.findOneAndUpdate(
    { name },
    { $set: { name, displayName, level, permissions, isSystemRole: true } },
    { upsert: true, new: true },
  );
  return role;
}

async function patchClerkRole(clerkUserId: string, role: string) {
  const { clerkClient } = await import("@clerk/nextjs/server");
  const client = await clerkClient();
  await client.users.updateUserMetadata(clerkUserId, {
    publicMetadata: { aotfRole: role },
  });
}

async function seed() {
  if (!process.env.FOUNDER_CLERK_USER_ID || !process.env.SUPERADMIN_CLERK_USER_ID) {
    throw new Error(
      "FOUNDER_CLERK_USER_ID and SUPERADMIN_CLERK_USER_ID are required for seeding.",
    );
  }

  const [{ default: dbConnect }, { PERMISSIONS }, { default: AdminRole }, { default: AdminUser }] =
    await Promise.all([
      import("../lib/db.js"),
      import("../lib/admin/permissions.js"),
      import("../lib/models/admin/AdminRole.js"),
      import("../lib/models/admin/AdminUser.js"),
    ]);

  await dbConnect();

  const founderPermissions = Object.values(PERMISSIONS);
  const superAdminPermissions = founderPermissions.filter(
    (permission) => permission !== PERMISSIONS.SUPERADMIN_MANAGE,
  );
  const crmPermissions = [
    PERMISSIONS.TUTOR_ADD,
    PERMISSIONS.TUTOR_REMOVE,
    PERMISSIONS.CANDIDATE_ADD,
    PERMISSIONS.CANDIDATE_REMOVE,
    PERMISSIONS.APPLICATION_APPROVE,
    PERMISSIONS.APPLICATION_REJECT,
    PERMISSIONS.COMMUNICATION_SEND,
    PERMISSIONS.CALENDAR_CREATE,
    PERMISSIONS.CALENDAR_EDIT,
  ];
  const frmPermissions = [
    PERMISSIONS.FACULTY_ADD,
    PERMISSIONS.FACULTY_REMOVE,
    PERMISSIONS.FACULTY_APPROVE,
    PERMISSIONS.COMMUNICATION_SEND,
    PERMISSIONS.CALENDAR_CREATE,
    PERMISSIONS.CALENDAR_EDIT,
  ];

  await Promise.all([
    upsertRole(AdminRole, "FOUNDER", "Founder", 0, founderPermissions),
    upsertRole(AdminRole, "SUPER_ADMIN", "Super Admin", 1, superAdminPermissions),
    upsertRole(AdminRole, "CRM", "Customer Relationship Manager", 2, crmPermissions),
    upsertRole(AdminRole, "FRM", "Faculty Relationship Manager", 2, frmPermissions),
  ]);

  const founder = await AdminUser.findOneAndUpdate(
    { clerkUserId: process.env.FOUNDER_CLERK_USER_ID },
    {
      $set: {
        clerkUserId: process.env.FOUNDER_CLERK_USER_ID,
        role: "FOUNDER",
        status: "ACTIVE",
        activatedAt: new Date(),
      },
      $setOnInsert: {
        email: "founder@aotf.in",
        name: "Soumyadip",
        invitedAt: new Date(),
      },
    },
    { upsert: true, new: true },
  );

  const superAdmin = await AdminUser.findOneAndUpdate(
    { clerkUserId: process.env.SUPERADMIN_CLERK_USER_ID },
    {
      $set: {
        clerkUserId: process.env.SUPERADMIN_CLERK_USER_ID,
        role: "SUPER_ADMIN",
        status: "ACTIVE",
        activatedAt: new Date(),
      },
      $setOnInsert: {
        email: "superadmin@aotf.in",
        name: "Poulomi",
        invitedBy: founder?._id ?? null,
        invitedAt: new Date(),
      },
    },
    { upsert: true, new: true },
  );

  await patchClerkRole(process.env.FOUNDER_CLERK_USER_ID, "FOUNDER");
  await patchClerkRole(process.env.SUPERADMIN_CLERK_USER_ID, "SUPER_ADMIN");

  console.log("Admin roles seeded.");
  console.log("Founder:", founder?._id?.toString() ?? "n/a");
  console.log("Super Admin:", superAdmin?._id?.toString() ?? "n/a");
}

seed()
  .then(async () => {
    console.log("seedAdminSystem completed.");
    await mongoose.connection.close();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error("seedAdminSystem failed:", error);
    await mongoose.connection.close();
    process.exit(1);
  });

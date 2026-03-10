/**
 * Superadmin Seeding Script
 * Creates the initial superadmin account
 *
 * Usage: pnpm seed
 * Or:    npx tsx scripts/seed-superadmin.ts
 */

import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";

// Load environment variables FIRST — before any module that reads process.env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../.env.local") });

// NOTE: db.ts and Admin.ts are NOT imported here because db.ts reads
// MONGODB_URI at module evaluation time (before dotenv.config() could run).
// They are dynamically imported inside seedSuperadmin() after env is loaded.

const SUPERADMIN_EMAIL = "aotf21@gmail.com";
const SUPERADMIN_USERNAME = "superadmin";
const SUPERADMIN_FIRST_NAME = "Super";
const SUPERADMIN_LAST_NAME = "Admin";

/**
 * Generate a secure random password
 */
function generateSecurePassword(length: number = 16): string {
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => charset[byte % charset.length]).join("");
}

/**
 * Create superadmin user in Clerk
 */
async function createClerkSuperadmin(
  email: string,
  username: string,
  password: string,
) {
  const response = await fetch("https://api.clerk.com/v1/users", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username,
      email_addresses: [email],
      password,
      first_name: SUPERADMIN_FIRST_NAME,
      last_name: SUPERADMIN_LAST_NAME,
      public_metadata: {
        isAdmin: true,
        role: "super_admin",
        requirePasswordChange: false,
      },
      skip_password_checks: false,
      skip_password_requirement: false,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error(
      "❌ Clerk API Error Response:",
      JSON.stringify(error, null, 2),
    );
    const firstError = error.errors?.[0];

    // Email or username already taken — look up the existing Clerk user
    if (
      firstError?.code === "form_identifier_exists" ||
      firstError?.message?.toLowerCase().includes("taken")
    ) {
      console.log("⚠️  Clerk user already exists, looking up existing user...");
      const existing = await getClerkUserByEmail(email);
      if (existing) {
        // Ensure metadata and password are correct on the existing user
        await patchClerkSuperadmin(existing.id, password);
        return existing;
      }
    }

    throw new Error(
      `Failed to create superadmin in Clerk: ${firstError?.message || response.statusText}`,
    );
  }

  return response.json();
}

/**
 * Check if a Clerk user exists by their Clerk user ID
 */
async function getClerkUserById(clerkId: string) {
  if (!clerkId) return null;
  const response = await fetch(`https://api.clerk.com/v1/users/${clerkId}`, {
    headers: {
      Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
    },
  });
  if (!response.ok) return null;
  return response.json();
}

/**
 * Delete a Clerk user by ID
 */
async function deleteClerkUser(clerkId: string) {
  const response = await fetch(`https://api.clerk.com/v1/users/${clerkId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
    },
  });
  return response.ok;
}

/**
 * Look up a Clerk user by email address
 */
async function getClerkUserByEmail(email: string) {
  const response = await fetch(
    `https://api.clerk.com/v1/users?email_address=${encodeURIComponent(email)}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
      },
    },
  );

  if (!response.ok) return null;
  const users = await response.json();
  return Array.isArray(users) ? users[0] : null;
}

/**
 * Patch an existing Clerk user's metadata and password
 */
async function patchClerkSuperadmin(clerkId: string, password: string) {
  // Update password only when a new one was generated
  if (password) {
    const pwRes = await fetch(`https://api.clerk.com/v1/users/${clerkId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        password,
        skip_password_checks: false,
      }),
    });
    if (!pwRes.ok) {
      const err = await pwRes.json();
      console.warn(
        `⚠️  Could not update Clerk password: ${err.errors?.[0]?.message || pwRes.statusText}`,
      );
    }
  }

  // Update publicMetadata
  const metaRes = await fetch(
    `https://api.clerk.com/v1/users/${clerkId}/metadata`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        public_metadata: {
          isAdmin: true,
          role: "super_admin",
          requirePasswordChange: false,
        },
      }),
    },
  );
  if (!metaRes.ok) {
    const err = await metaRes.json();
    console.warn(
      `⚠️  Could not update Clerk metadata: ${err.errors?.[0]?.message || metaRes.statusText}`,
    );
  } else {
    console.log("✅ Clerk metadata updated (isAdmin: true, role: super_admin)");
  }
}

/**
 * Main seeding function
 */
async function seedSuperadmin() {
  // Dynamic imports run AFTER dotenv.config() has already set process.env
  const { default: dbConnect } = await import("../lib/db.js");
  const { default: Admin } = await import("../lib/models/Admin.js");

  const isForce = process.argv.includes("--force");

  try {
    console.log("🌱 Starting superadmin seeding...\n");
    if (isForce)
      console.log("⚠️  --force flag detected: will wipe and recreate\n");

    // Validate environment variables
    if (!process.env.CLERK_SECRET_KEY) {
      throw new Error("CLERK_SECRET_KEY is not set in environment variables");
    }

    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is not set in environment variables");
    }

    // Connect to database
    console.log("📦 Connecting to MongoDB...");
    await dbConnect();
    console.log("✅ Connected to MongoDB\n");

    // Check if superadmin already exists in MongoDB
    console.log("🔍 Checking if superadmin already exists in MongoDB...");
    const existingAdmin = await Admin.findOne({
      $or: [{ email: SUPERADMIN_EMAIL }, { username: SUPERADMIN_USERNAME }],
    });

    if (existingAdmin && isForce) {
      console.log("🗑️  --force: deleting existing MongoDB Admin record...");
      if (existingAdmin.clerkId) {
        const deleted = await deleteClerkUser(existingAdmin.clerkId);
        console.log(
          deleted
            ? `✅ Clerk user ${existingAdmin.clerkId} deleted`
            : `⚠️  Clerk user ${existingAdmin.clerkId} not found or already deleted`,
        );
      }
      await Admin.deleteOne({ _id: existingAdmin._id });
      console.log("✅ MongoDB Admin record deleted\n");
      // Fall through to fresh creation below
    } else if (existingAdmin) {
      console.log("⚠️  Superadmin found in MongoDB:");
      console.log(`   Username : ${existingAdmin.username}`);
      console.log(`   Email    : ${existingAdmin.email}`);
      console.log(`   Clerk ID : ${existingAdmin.clerkId || "(none)"}`);
      console.log(`   Role     : ${existingAdmin.role}`);
      console.log(`   Active   : ${existingAdmin.isActive}`);

      // Verify the Clerk user actually exists
      console.log("\n🔍 Verifying Clerk user exists...");
      const clerkUser = existingAdmin.clerkId
        ? await getClerkUserById(existingAdmin.clerkId)
        : null;

      if (clerkUser) {
        // Clerk user is present — just refresh metadata
        console.log(`✅ Clerk user found (${clerkUser.id})`);
        console.log("🔄 Refreshing Clerk metadata...");
        await patchClerkSuperadmin(clerkUser.id, "");
        console.log(
          "✨ Seeding skipped — superadmin already exists (metadata refreshed)",
        );
      } else {
        // MongoDB record exists but Clerk user is GONE — recreate Clerk user
        console.log(
          "❌ Clerk user not found! MongoDB record exists but Clerk user is missing.",
        );
        console.log(
          "🔄 Recreating Clerk user and updating MongoDB clerkId...\n",
        );

        const password = generateSecurePassword(20);

        const newClerkUser = await createClerkSuperadmin(
          SUPERADMIN_EMAIL,
          SUPERADMIN_USERNAME,
          password,
        );
        console.log(`✅ New Clerk user created: ${newClerkUser.id}\n`);

        // Update MongoDB with the new clerkId
        existingAdmin.clerkId = newClerkUser.id;
        await existingAdmin.save();
        console.log(
          `✅ MongoDB Admin record updated with new clerkId: ${newClerkUser.id}\n`,
        );

        console.log("═══════════════════════════════════════════════════════");
        console.log("🎉 SUPERADMIN CLERK ACCOUNT RESTORED!");
        console.log("═══════════════════════════════════════════════════════");
        console.log("");
        console.log("📧 Email:    ", SUPERADMIN_EMAIL);
        console.log("👤 Username: ", SUPERADMIN_USERNAME);
        console.log("🔑 Password: ", password);
        console.log("");
        console.log("═══════════════════════════════════════════════════════");
        console.log("");
        console.log(
          "⚠️  IMPORTANT: Save these credentials in a secure location.",
        );
        console.log("");
        console.log("═══════════════════════════════════════════════════════");
      }
      return;
    }

    console.log("✅ No existing superadmin found\n");

    // Generate password
    console.log("🔐 Generating secure password...");
    const password = generateSecurePassword(20);
    console.log("✅ Password generated\n");

    // Create user in Clerk
    console.log("👤 Creating superadmin in Clerk...");
    const clerkUser = await createClerkSuperadmin(
      SUPERADMIN_EMAIL,
      SUPERADMIN_USERNAME,
      password,
    );
    console.log(`✅ Clerk user created with ID: ${clerkUser.id}\n`);

    // Create admin in database
    console.log("💾 Creating superadmin in database...");
    const permissions = Admin.getDefaultPermissions("super_admin");

    const admin = await Admin.create({
      clerkId: clerkUser.id,
      username: SUPERADMIN_USERNAME,
      email: SUPERADMIN_EMAIL,
      name: `${SUPERADMIN_FIRST_NAME} ${SUPERADMIN_LAST_NAME}`,
      role: "super_admin",
      permissions,
      isActive: true,
      isLocked: false,
      requirePasswordChange: false,
      createdBy: null,
    });

    console.log("✅ Superadmin created in database\n");

    // Display credentials
    console.log("═══════════════════════════════════════════════════════");
    console.log("🎉 SUPERADMIN CREATED SUCCESSFULLY!");
    console.log("═══════════════════════════════════════════════════════");
    console.log("");
    console.log("📧 Email:    ", SUPERADMIN_EMAIL);
    console.log("👤 Username: ", SUPERADMIN_USERNAME);
    console.log("🔑 Password: ", password);
    console.log("");
    console.log("═══════════════════════════════════════════════════════");
    console.log("");
    console.log("⚠️  IMPORTANT:");
    console.log("   1. Save these credentials in a secure location");
    console.log("   2. Access admin panel at: /admin/login");
    console.log("   3. Consider changing the password after first login");
    console.log("   4. This password will NOT be shown again");
    console.log("");
    console.log("═══════════════════════════════════════════════════════");
  } catch (error) {
    console.error("\n❌ Error seeding superadmin:", error);
    throw error;
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log("\n🔌 Database connection closed");
  }
}

// Run the seeding script
seedSuperadmin()
  .then(() => {
    console.log("\n✨ Seeding completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Seeding failed:", error);
    process.exit(1);
  });

import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/lib/models/User";
import Profile from "@/lib/models/Profile";
import OnboardingDetails from "@/lib/models/OnboardingDetails";
import WebhookEvent from "@/lib/models/WebhookEvent";
import mongoose from "mongoose";

export async function POST(req: NextRequest) {
  let evt: Awaited<ReturnType<typeof verifyWebhook>>;

  try {
    evt = await verifyWebhook(req, {
      signingSecret: process.env.CLERK_WEBHOOK_SECRET!,
    });
  } catch (err) {
    console.error("[clerk-webhook] Verification failed:", err);
    return NextResponse.json(
      { error: "Webhook verification failed" },
      { status: 400 },
    );
  }

  const eventType = evt.type;
  const data = evt.data as unknown as Record<string, unknown>;
  const entityId = (data.id as string) ?? "";

  console.log(`[clerk-webhook] Received event: ${eventType} for ${entityId}`);

  await dbConnect();

  // Idempotency guard + event processing are kept in a single try block so
  // that a failed handler never leaves behind an unprocessed WebhookEvent
  // document that would permanently block future retries for the same event.
  try {
    // Write the idempotency record first. A duplicate-key error (11000) means
    // we already handled this delivery — return 200 immediately.
    try {
      await WebhookEvent.create({
        provider: "clerk",
        event: eventType,
        entityId,
        payload: data,
        signature: req.headers.get("svix-signature") ?? "",
      });
    } catch (err: unknown) {
      if (
        typeof err === "object" &&
        err !== null &&
        "code" in err &&
        (err as { code: number }).code === 11000
      ) {
        console.log(`[clerk-webhook] Duplicate event ${entityId}, skipping`);
        return NextResponse.json({ received: true });
      }
      throw err;
    }

    switch (eventType) {
      case "user.created":
        await handleUserCreated(data);
        break;
      case "user.updated":
        await handleUserUpdated(data);
        break;
      case "user.deleted":
        await handleUserDeleted(data);
        break;
      default:
        console.log(`[clerk-webhook] Unhandled event type: ${eventType}`);
    }

    await WebhookEvent.updateOne(
      { provider: "clerk", event: eventType, entityId },
      { processed: true, processedAt: new Date() },
    );
  } catch (err) {
    console.error(`[clerk-webhook] Error processing ${eventType}:`, err);
    // Delete the idempotency record so that Clerk's automatic retry can
    // attempt the event again on the next delivery.
    await WebhookEvent.deleteOne({
      provider: "clerk",
      event: eventType,
      entityId,
    }).catch(() => {});
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 },
    );
  }

  return NextResponse.json({ received: true });
}

async function handleUserCreated(data: Record<string, unknown>) {
  const clerkId = data.id as string;

  if (!clerkId) {
    throw new Error("Missing clerkId in user.created event");
  }

  // username is null when Clerk is configured without a username requirement,
  // during OAuth sign-ups, and in every Clerk test-event payload.
  // Derive a stable, URL-safe fallback from the primary email + clerkId suffix.
  let username = (data.username as string)?.toLowerCase().trim();

  if (!username) {
    const emails =
      (data.email_addresses as
        | Array<{ id: string; email_address: string }>
        | undefined) ?? [];
    const primaryEmailId = data.primary_email_address_id as string | undefined;
    const primaryEmail =
      (emails.find((e) => e.id === primaryEmailId) ?? emails[0])
        ?.email_address ?? "";

    // Keep only alphanumeric chars from the local part, limit to 15 chars.
    const localPart = primaryEmail
      .split("@")[0]
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "")
      .slice(0, 15);

    // Append last 8 chars of clerkId (after "user_") to guarantee uniqueness.
    const suffix = clerkId.replace("user_", "").slice(-8);
    username = `${localPart || "user"}${suffix}`;
  }

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      // 1. Find by clerkId (clean re-delivery) or by username (orphaned doc
      //    left by a previous failed attempt with a different/null clerkId).
      //    If found by username, adopt it by writing the correct clerkId.
      let userDoc = await User.findOneAndUpdate(
        { $or: [{ clerkId }, { username }] },
        { $set: { clerkId, status: "active" } },
        { new: true, session },
      );

      if (!userDoc) {
        // First-ever delivery — create fresh.
        const created = await User.create(
          [
            {
              clerkId,
              username,
              role: "teacher",
              plan: {
                current: "teacher",
                hasTuitionAccess: false,
                hasCandidateAccess: false,
                activatedAt: null,
              },
              onboardingCompleted: false,
              status: "active",
              registrationPaymentId: null,
            },
          ],
          { session },
        );
        userDoc = created[0];
      }

      // Same pattern for Profile.
      const existingProfile = await Profile.findOneAndUpdate(
        { $or: [{ clerkId }, { username }] },
        { $set: { clerkId, userId: userDoc._id } },
        { new: true, session },
      );

      if (!existingProfile) {
        await Profile.create(
          [
            {
              userId: userDoc._id,
              clerkId,
              username,
              displayName: null,
              bio: null,
              avatarUrl: null,
              location: null,
              websiteUrl: null,
              socialLinks: {},
              subjects: [],
              experience: null,
              isPublic: true,
            },
          ],
          { session },
        );
      }
    });
  } finally {
    await session.endSession();
  }

  // Mirror business state into Clerk publicMetadata so the JWT carries these
  // claims. MongoDB is the source of truth; Clerk publicMetadata is the read
  // cache. proxy.ts reads onboardingCompleted from sessionClaims to gate routes.
  //
  // Retry with backoff: Clerk occasionally fires user.created before the user
  // is fully available via the Management API, causing a transient 404.
  const delays = [500, 1500, 3000];
  let lastErr: unknown;
  for (let attempt = 0; attempt <= delays.length; attempt++) {
    if (attempt > 0) {
      await new Promise((r) => setTimeout(r, delays[attempt - 1]));
    }
    try {
      const client = await clerkClient();
      await client.users.updateUserMetadata(clerkId, {
        publicMetadata: {
          role: "teacher",
          onboardingCompleted: false,
        },
      });
      lastErr = null;
      break;
    } catch (err: unknown) {
      lastErr = err;
      const status =
        typeof err === "object" && err !== null && "status" in err
          ? (err as { status: number }).status
          : null;
      // Only retry on 404 (transient propagation delay); bail immediately for other errors
      if (status !== 404) break;
      console.warn(
        `[clerk-webhook] updateUserMetadata 404 for ${clerkId}, attempt ${attempt + 1}/${delays.length + 1} — retrying…`,
      );
    }
  }
  if (lastErr) {
    // Non-fatal: MongoDB record exists. Log for investigation.
    console.error(
      `[clerk-webhook] Failed to set publicMetadata for ${clerkId} after retries:`,
      lastErr,
    );
  }

  console.log(`[clerk-webhook] Created user and profile for ${clerkId}`);
}

async function handleUserUpdated(data: Record<string, unknown>) {
  const clerkId = data.id as string;
  const newUsername = (data.username as string)?.toLowerCase().trim();

  if (!clerkId) return;

  const user = await User.findOne({ clerkId });
  if (!user) {
    console.warn(`[clerk-webhook] user.updated: User not found for ${clerkId}`);
    return;
  }

  // Only sync if username actually changed
  if (newUsername && newUsername !== user.username) {
    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        await User.updateOne(
          { clerkId },
          { username: newUsername },
          { session },
        );
        await Profile.updateOne(
          { clerkId },
          { username: newUsername },
          { session },
        );
      });
    } finally {
      await session.endSession();
    }
    console.log(
      `[clerk-webhook] Synced username for ${clerkId}: ${user.username} → ${newUsername}`,
    );
  }
}

async function handleUserDeleted(data: Record<string, unknown>) {
  const clerkId = data.id as string;
  if (!clerkId) return;

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      await User.updateOne({ clerkId }, { status: "deleted" }, { session });
      await Profile.updateOne({ clerkId }, { isPublic: false }, { session });
      // Also remove OnboardingDetails (if any) since the account is gone
      await OnboardingDetails.deleteOne({ clerkId }).session(session);
    });
  } finally {
    await session.endSession();
  }

  console.log(`[clerk-webhook] Soft-deleted user ${clerkId}`);
}

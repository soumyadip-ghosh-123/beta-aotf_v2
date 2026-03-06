import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/lib/models/User";
import Profile from "@/lib/models/Profile";
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
      { provider: "clerk", entityId },
      { processed: true, processedAt: new Date() },
    );
  } catch (err) {
    console.error(`[clerk-webhook] Error processing ${eventType}:`, err);
    // Delete the idempotency record so that Clerk's automatic retry can
    // attempt the event again on the next delivery.
    await WebhookEvent.deleteOne({ provider: "clerk", entityId }).catch(
      () => {},
    );
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 },
    );
  }

  return NextResponse.json({ received: true });
}

async function handleUserCreated(data: Record<string, unknown>) {
  const clerkId = data.id as string;
  const username = (data.username as string)?.toLowerCase().trim();

  if (!clerkId || !username) {
    throw new Error("Missing clerkId or username in user.created event");
  }

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const user = await User.create(
        [
          {
            clerkId,
            username,
            role: "teacher",
            plan: {
              current: "teacher",
              hasTuitionAccess: true,
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

      await Profile.create(
        [
          {
            userId: user[0]._id,
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
    });
  } finally {
    await session.endSession();
  }

  // Mirror business state into Clerk publicMetadata so the JWT carries these
  // claims. MongoDB is the source of truth; Clerk publicMetadata is the read
  // cache. proxy.ts reads onboardingCompleted from sessionClaims to gate routes.
  try {
    const client = await clerkClient();
    await client.users.updateUserMetadata(clerkId, {
      publicMetadata: {
        role: "teacher",
        onboardingCompleted: false,
      },
    });
  } catch (err) {
    // Non-fatal: the user exists in MongoDB. The onboarding flow will re-sync
    // these claims when it runs. Log so it can be investigated.
    console.error(
      `[clerk-webhook] Failed to set publicMetadata for ${clerkId}:`,
      err,
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
    });
  } finally {
    await session.endSession();
  }

  console.log(`[clerk-webhook] Soft-deleted user ${clerkId}`);
}

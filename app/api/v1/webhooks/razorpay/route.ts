import { NextResponse } from "next/server";
import crypto from "crypto";
import { clerkClient } from "@clerk/nextjs/server";
import dbConnect from "@/lib/db";
import User from "@/lib/models/User";
import Payment from "@/lib/models/Payment";
import WebhookEvent from "@/lib/models/WebhookEvent";

export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-razorpay-signature") ?? "";

  // Verify Razorpay webhook signature
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
    .update(rawBody)
    .digest("hex");

  if (expectedSignature !== signature) {
    console.error("[razorpay-webhook] Signature verification failed");
    return NextResponse.json(
      { error: "Invalid webhook signature" },
      { status: 400 },
    );
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const event = payload.event as string;
  const paymentEntity = (
    payload.payload as Record<string, Record<string, Record<string, unknown>>>
  )?.payment?.entity;
  const entityId = (paymentEntity?.id as string) ?? "";
  const orderId = (paymentEntity?.order_id as string) ?? null;

  console.log(
    `[razorpay-webhook] Received event: ${event}, entityId: ${entityId}`,
  );

  await dbConnect();

  // Idempotency: upsert webhook event, skip if duplicate
  try {
    await WebhookEvent.create({
      provider: "razorpay",
      event,
      entityId,
      orderId,
      payload,
      signature,
    });
  } catch (err: unknown) {
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code: number }).code === 11000
    ) {
      console.log(
        `[razorpay-webhook] Duplicate event ${entityId}, returning 200`,
      );
      return NextResponse.json({ received: true });
    }
    throw err;
  }

  try {
    if (event === "payment.captured") {
      await handlePaymentCaptured(entityId, orderId);
    } else {
      console.log(`[razorpay-webhook] Unhandled event: ${event}`);
    }

    await WebhookEvent.updateOne(
      { provider: "razorpay", entityId },
      { processed: true, processedAt: new Date() },
    );
  } catch (err) {
    console.error(`[razorpay-webhook] Error processing ${event}:`, err);
    await WebhookEvent.updateOne(
      { provider: "razorpay", entityId },
      { error: err instanceof Error ? err.message : "Unknown error" },
    );
  }

  // Always return 200 to prevent Razorpay retries for processing errors
  return NextResponse.json({ received: true });
}

async function handlePaymentCaptured(
  paymentId: string,
  orderId: string | null,
) {
  if (!orderId) {
    console.warn("[razorpay-webhook] payment.captured without order_id");
    return;
  }

  const payment = await Payment.findOne({ providerOrderId: orderId });
  if (!payment) {
    console.warn(`[razorpay-webhook] No payment record for order ${orderId}`);
    return;
  }

  // Idempotency: already processed
  if (payment.status === "paid") {
    console.log(
      `[razorpay-webhook] Payment for order ${orderId} already marked paid`,
    );
    return;
  }

  payment.status = "paid";
  payment.providerPaymentId = paymentId;
  payment.paidAt = new Date();
  await payment.save();

  const toPlan = payment.toPlan;

  await User.updateOne(
    { _id: payment.userId },
    {
      "plan.current": toPlan,
      "plan.hasCandidateAccess": toPlan === "teacher_candidate",
      "plan.activatedAt": new Date(),
      onboardingCompleted: true,
      registrationPaymentId: payment._id,
      role: toPlan,
    },
  );

  // Sync to Clerk
  const client = await clerkClient();
  await client.users.updateUserMetadata(payment.clerkId, {
    publicMetadata: {
      onboardingCompleted: true,
      role: toPlan,
    },
  });

  console.log(
    `[razorpay-webhook] Fallback: verified payment for order ${orderId}, plan: ${toPlan}`,
  );
}

import { handleApiError } from "@/lib/api-utils";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import dbConnect from "@/lib/db";
import User from "@/lib/models/User";
import Payment from "@/lib/models/Payment";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: Request) {
  try {
    const { userId: clerkId, sessionClaims } = await auth();
    if (!clerkId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    // ── Legacy-migration short-circuit ───────────────────────────────────────
    // Users migrated from the old backend already paid there. Their Clerk
    // publicMetadata carries migratedFromLegacy: true + registrationFeeStatus: "paid".
    // Return a sentinel response so the onboarding page skips Razorpay and
    // calls /api/v1/payments/activate-legacy instead.
    const meta = (sessionClaims?.publicMetadata ?? {}) as Record<string, unknown>;
    if (
      meta.migratedFromLegacy === true &&
      meta.registrationFeeStatus === "paid"
    ) {
      console.log(
        `[create-order] Migrated legacy user ${clerkId} — skipping Razorpay`,
      );
      return NextResponse.json({ alreadyPaid: true });
    }
    // ─────────────────────────────────────────────────────────────────────────

    const body = await req.json();
    const plan = body.plan as "teacher" | "teacher_candidate";

    if (!["teacher", "teacher_candidate"].includes(plan)) {
      return NextResponse.json(
        { error: "Invalid plan. Must be 'teacher' or 'teacher_candidate'" },
        { status: 400 },
      );
    }

    await dbConnect();

    const user = await User.findOne({ clerkId });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const isTeacherToCandidateUpgrade =
      user.onboardingCompleted &&
      user.plan?.current === "teacher" &&
      plan === "teacher_candidate";

    const amount = isTeacherToCandidateUpgrade
      ? 5000
      : plan === "teacher"
        ? 4900
        : 9900;

    const purpose = isTeacherToCandidateUpgrade
      ? "plan_upgrade"
      : "registration";

    const fromPlan = isTeacherToCandidateUpgrade ? user.plan?.current : null;

    const razorpayOrder = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: `reg_${user._id.toString().slice(-8)}_${Date.now()}`,
    });

    const payment = await Payment.create({
      userId: user._id,
      clerkId,
      purpose,
      fromPlan,
      toPlan: plan,
      amount,
      currency: "INR",
      provider: "razorpay",
      providerOrderId: razorpayOrder.id,
      status: "created",
    });

    console.log(
      `[create-order] Order ${razorpayOrder.id} created for user ${clerkId}, from: ${fromPlan ?? "none"}, to: ${plan}, amount: ${amount}`,
    );

    return NextResponse.json({
      orderId: razorpayOrder.id,
      paymentId: payment._id,
      amount,
      currency: "INR",
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    });
  } catch (error) {
    return handleApiError(error, "POST /api/v1/payments/create-order");
  }
}

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
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const body = await req.json();
    const plan = body.plan as string;

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

    const amount = plan === "teacher" ? 4900 : 9900;

    const razorpayOrder = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: `reg_${user._id.toString().slice(-8)}_${Date.now()}`,
    });

    const payment = await Payment.create({
      userId: user._id,
      clerkId,
      purpose: "registration",
      toPlan: plan,
      amount,
      currency: "INR",
      provider: "razorpay",
      providerOrderId: razorpayOrder.id,
      status: "created",
    });

    console.log(
      `[create-order] Order ${razorpayOrder.id} created for user ${clerkId}, plan: ${plan}, amount: ${amount}`,
    );

    return NextResponse.json({
      orderId: razorpayOrder.id,
      paymentId: payment._id,
      amount,
      currency: "INR",
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("[create-order] Error:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 },
    );
  }
}

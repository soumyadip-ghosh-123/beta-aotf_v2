import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/db";
import Admin from "@/lib/models/Admin";
import User from "@/lib/models/User";
import Post from "@/lib/models/Post";
import Enquiry from "@/lib/models/Enquiry";
import Payment from "@/lib/models/Payment";
import Feedback from "@/lib/models/Feedback";
import AuditLog from "@/lib/models/AuditLog";

// ─── Helpers ────────────────────────────────────────────────────────────────

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d;
}

// ─── Role-specific aggregators ──────────────────────────────────────────────

async function getSuperAdminData(adminClerkId: string) {
  const thirtyDaysAgo = daysAgo(30);
  const todayStart    = startOfDay(new Date());

  const [
    totalUsers,
    activePosts,
    enquiryBreakdown,
    revenueTotal,
    adminsByRole,
    recentPayments,
    recentEnquiries,
    postsByStatus,
    revenueTrend,
    recentAuditLog,
    totalFeedbacks,
    openFeedbacks,
  ] = await Promise.all([
    // Total registered users
    User.countDocuments({ status: "active" }),

    // Active (open) tuition/job posts
    Post.countDocuments({ status: "open" }),

    // Enquiry breakdown: new vs in_progress
    Enquiry.aggregate([
      { $group: { _id: "$currentStatus", count: { $sum: 1 } } },
    ]),

    // Revenue: sum of paid payments
    Payment.aggregate([
      { $match: { status: "paid" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),

    // Admins by role
    Admin.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: "$role", count: { $sum: 1 } } },
    ]),

    // Recent payments (last 5)
    Payment.find({ status: "paid" })
      .sort({ paidAt: -1 })
      .limit(5)
      .select("amount purpose status paidAt createdAt")
      .lean(),

    // Recent enquiries (last 5)
    Enquiry.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("name query currentStatus createdAt")
      .lean(),

    // Posts by status
    Post.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),

    // Revenue trend — daily totals for last 30 days
    Payment.aggregate([
      { $match: { status: "paid", paidAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$paidAt" },
          },
          total: { $sum: "$amount" },
        },
      },
      { $sort: { _id: 1 } },
    ]),

    // Audit log (last 5)
    AuditLog.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("adminUsername action targetType targetIdentifier createdAt")
      .lean(),

    // Total feedbacks
    Feedback.countDocuments(),

    // Open (unresolved) feedbacks
    Feedback.countDocuments({ status: "open" }),
  ]);

  // Normalise enquiry breakdown into a map
  const enqMap: Record<string, number> = {};
  for (const row of enquiryBreakdown as Array<{ _id: string; count: number }>) {
    enqMap[row._id] = row.count;
  }

  // Normalise admin counts
  const adminMap: Record<string, number> = {};
  for (const row of adminsByRole as Array<{ _id: string; count: number }>) {
    adminMap[row._id] = row.count;
  }

  // Normalise posts by status
  const postsMap: Record<string, number> = {};
  for (const row of postsByStatus as Array<{ _id: string; count: number }>) {
    postsMap[row._id] = row.count;
  }

  return {
    role: "super_admin" as const,
    stats: {
      totalUsers,
      activePosts,
      enquiries: {
        new:        enqMap["new"]         ?? 0,
        inProgress: enqMap["in_progress"] ?? 0,
        total:      Object.values(enqMap).reduce((a, b) => a + b, 0),
      },
      revenue: (revenueTotal as Array<{ total: number }>)[0]?.total ?? 0,
      admins: adminMap,
      feedbacks: { total: totalFeedbacks, open: openFeedbacks },
    },
    postsByStatus: postsMap,
    recentPayments,
    recentEnquiries,
    revenueTrend: revenueTrend as Array<{ _id: string; total: number }>,
    recentAuditLog,
  };
}

async function getAdminData(adminDoc: { clerkId: string; _id: mongoose.Types.ObjectId }) {
  const [
    activePosts,
    enquiryBreakdown,
    postsByStatus,
    recentEnquiries,
    myPostsCount,
    myEnquiriesCount,
  ] = await Promise.all([
    Post.countDocuments({ status: "open" }),

    Enquiry.aggregate([
      { $group: { _id: "$currentStatus", count: { $sum: 1 } } },
    ]),

    Post.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),

    Enquiry.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("name query currentStatus createdAt")
      .lean(),

    // Posts created by this admin
    Post.countDocuments({ createdByAdminClerkId: adminDoc.clerkId }),

    // Enquiries last touched by this admin
    Enquiry.countDocuments({ lastActionByAdminId: adminDoc._id }),
  ]);

  const enqMap: Record<string, number> = {};
  for (const row of enquiryBreakdown as Array<{ _id: string; count: number }>) {
    enqMap[row._id] = row.count;
  }

  const postsMap: Record<string, number> = {};
  for (const row of postsByStatus as Array<{ _id: string; count: number }>) {
    postsMap[row._id] = row.count;
  }

  return {
    role: "admin" as const,
    stats: {
      activePosts,
      enquiries: {
        new:        enqMap["new"]         ?? 0,
        inProgress: enqMap["in_progress"] ?? 0,
        total:      Object.values(enqMap).reduce((a, b) => a + b, 0),
      },
    },
    postsByStatus: postsMap,
    recentEnquiries,
    myActivity: {
      postsCreated:    myPostsCount,
      enquiriesHandled: myEnquiriesCount,
    },
  };
}

async function getSupportAdminData(adminDoc: { _id: mongoose.Types.ObjectId }) {
  const todayStart = startOfDay(new Date());

  const [
    myOpenEnquiries,
    myEnquiryBreakdown,
    handledToday,
    recentFeedbacks,
  ] = await Promise.all([
    Enquiry.countDocuments({
      lastActionByAdminId: adminDoc._id,
      currentStatus: { $in: ["new", "in_progress", "contacted"] },
    }),

    Enquiry.aggregate([
      { $match: { lastActionByAdminId: adminDoc._id } },
      { $group: { _id: "$currentStatus", count: { $sum: 1 } } },
    ]),

    Enquiry.countDocuments({
      lastActionByAdminId: adminDoc._id,
      lastActionAt: { $gte: todayStart },
    }),

    Feedback.find({ handledByAdminId: adminDoc._id })
      .sort({ handledAt: -1 })
      .limit(5)
      .select("userSnapshot.name category subject status handledAt createdAt")
      .lean(),
  ]);

  const enqMap: Record<string, number> = {};
  for (const row of myEnquiryBreakdown as Array<{ _id: string; count: number }>) {
    enqMap[row._id] = row.count;
  }

  return {
    role: "support_admin" as const,
    stats: {
      myOpenEnquiries,
      handledToday,
      enquiryBreakdown: {
        new:        enqMap["new"]         ?? 0,
        inProgress: enqMap["in_progress"] ?? 0,
        contacted:  enqMap["contacted"]   ?? 0,
        resolved:   enqMap["resolved"]    ?? 0,
      },
    },
    recentFeedbacks,
  };
}

// ─── Route handler ──────────────────────────────────────────────────────────

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const adminRaw = await Admin.findOne(
      { clerkId: userId },
      { clerkId: 1, role: 1, isActive: 1, _id: 1 }
    ).lean();

    if (!adminRaw || !adminRaw.isActive) {
      return NextResponse.json(
        { error: "Forbidden: admin not active" },
        { status: 403 }
      );
    }

    // Cast _id safely — lean() returns ObjectId at runtime
    const admin = adminRaw as typeof adminRaw & { _id: mongoose.Types.ObjectId };

    let data;
    if (admin.role === "super_admin") {
      data = await getSuperAdminData(admin.clerkId);
    } else if (admin.role === "admin") {
      data = await getAdminData(admin);
    } else {
      data = await getSupportAdminData(admin);
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("[dashboard-api] Error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

import mongoose from "mongoose";
import { clerkClient } from "@clerk/nextjs/server";
import dbConnect from "@/lib/db";
import Feedback, {
  type FeedbackCategory,
  type FeedbackStatus,
  type FeedbackUserSnapshot,
  type FeedbackUserType,
} from "@/lib/models/Feedback";
import Profile from "@/lib/models/Profile";
import { NotFoundError, ValidationError } from "@/lib/errors";
import { ensureUserRecord } from "@/lib/utils/ensure-user";
import type {
  CreateFeedbackInput,
  ListFeedbacksInput,
  UpdateFeedbackInput,
} from "@/lib/validations/feedback";

export interface EnrichedFeedback {
  _id: string;
  userId: string;
  userType: FeedbackUserType;
  userSnapshot: FeedbackUserSnapshot;
  category: FeedbackCategory;
  subject: string;
  message: string;
  rating: number | null;
  status: FeedbackStatus;
  handledByAdminId: string | null;
  handledAt: Date | null;
  adminNotes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginatedFeedbacks {
  feedbacks: EnrichedFeedback[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

function serializeFeedback(feedback: {
  _id: unknown;
  userId: unknown;
  userType: FeedbackUserType;
  userSnapshot: FeedbackUserSnapshot;
  category: FeedbackCategory;
  subject: string;
  message: string;
  rating?: number | null;
  status: FeedbackStatus;
  handledByAdminId?: unknown;
  handledAt?: Date | null;
  adminNotes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}): EnrichedFeedback {
  return {
    _id: String(feedback._id),
    userId: String(feedback.userId),
    userType: feedback.userType,
    userSnapshot: feedback.userSnapshot,
    category: feedback.category,
    subject: feedback.subject,
    message: feedback.message,
    rating: feedback.rating ?? null,
    status: feedback.status,
    handledByAdminId: feedback.handledByAdminId
      ? String(feedback.handledByAdminId)
      : null,
    handledAt: feedback.handledAt ?? null,
    adminNotes: feedback.adminNotes ?? null,
    createdAt: feedback.createdAt,
    updatedAt: feedback.updatedAt,
  };
}

async function buildUserSnapshot(clerkId: string): Promise<{
  userId: mongoose.Types.ObjectId;
  userType: FeedbackUserType;
  userSnapshot: FeedbackUserSnapshot;
}> {
  const user = await ensureUserRecord(clerkId);

  if (user.status !== "active") {
    throw new ValidationError(
      "Your account is not allowed to send feedback right now.",
    );
  }

  const [profile, clerkUser] = await Promise.all([
    Profile.findOne({ clerkId }).lean<{
      username?: string | null;
      displayName?: string | null;
    }>(),
    (await clerkClient()).users.getUser(clerkId),
  ]);

  const primaryEmail =
    clerkUser.emailAddresses.find(
      (entry) => entry.id === clerkUser.primaryEmailAddressId,
    )?.emailAddress ?? clerkUser.emailAddresses[0]?.emailAddress;

  if (!primaryEmail) {
    throw new ValidationError(
      "A verified email address is required to send feedback.",
    );
  }

  const fallbackName = [clerkUser.firstName, clerkUser.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();

  const userType: FeedbackUserType =
    user.role === "teacher_candidate" ? "teacher_candidate" : "teacher";

  return {
    userId: user._id,
    userType,
    userSnapshot: {
      name:
        profile?.displayName?.trim() ||
        fallbackName ||
        profile?.username?.trim() ||
        user.username,
      username: user.username,
      role: userType,
      email: primaryEmail,
    },
  };
}

export async function createFeedback(
  clerkId: string,
  input: CreateFeedbackInput,
): Promise<EnrichedFeedback> {
  await dbConnect();

  const { userId, userType, userSnapshot } = await buildUserSnapshot(clerkId);

  const feedback = await Feedback.create({
    userId,
    userType,
    userSnapshot,
    category: input.category,
    subject: input.subject,
    message: input.message,
    rating: input.rating ?? null,
    status: "open",
  });

  return serializeFeedback(feedback.toObject());
}

export async function listFeedbacks(
  input: ListFeedbacksInput,
): Promise<PaginatedFeedbacks> {
  await dbConnect();

  const { status, category, page, limit } = input;
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = {};
  if (status !== "all") {
    filter.status = status;
  }
  if (category !== "all") {
    filter.category = category;
  }

  const [feedbacks, total] = await Promise.all([
    Feedback.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Feedback.countDocuments(filter),
  ]);

  return {
    feedbacks: feedbacks.map((feedback) => serializeFeedback(feedback)),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function updateFeedback(
  feedbackId: string,
  input: UpdateFeedbackInput,
  adminId: string,
): Promise<EnrichedFeedback> {
  await dbConnect();

  const feedback = await Feedback.findById(feedbackId);
  if (!feedback) {
    throw new NotFoundError("Feedback");
  }

  feedback.status = input.status;
  feedback.adminNotes = input.adminNotes?.trim() || null;
  feedback.handledByAdminId = new mongoose.Types.ObjectId(adminId);
  feedback.handledAt = new Date();

  await feedback.save();

  return serializeFeedback(feedback.toObject());
}

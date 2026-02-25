import mongoose from "mongoose";
import dbConnect from "@/lib/db";
import Enquiry, { type EnquiryStatus } from "@/lib/models/Enquiry";
import EnqStatus from "@/lib/models/EnqStatus";
import { ConflictError, NotFoundError } from "@/lib/errors";
import type {
  CreateEnquiryInput,
  UpdateStatusInput,
  ListEnquiriesInput,
} from "@/lib/validations/enquiry";

// ─── Types returned to route handlers ───────────────────────────────────

/** Shape returned by listEnquiries for the admin panel */
export interface EnrichedEnquiry {
  _id: string;
  enquiryId: string;
  name: string;
  phoneNumber: string;
  query: string;
  currentStatus: EnquiryStatus;
  firstResponseAt?: Date;
  resolvedAt?: Date;
  lastActionByAdminName: string | null;
  lastActionByAdminRole: string | null;
  lastAttemptNumber: number;
  lastActionAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginatedEnquiries {
  enquiries: EnrichedEnquiry[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface StatusUpdateResult {
  fromStatus: EnquiryStatus;
  toStatus: EnquiryStatus;
  attemptNumber: number;
}

// ─── Helpers ────────────────────────────────────────────────────────────

/**
 * Generate a unique enquiry ID in the format `E-DDMMYY-XXX`.
 * XXX is a 3-digit daily counter (001–999).
 */
async function generateEnquiryId(): Promise<string> {
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, "0");
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const yy = String(now.getFullYear()).slice(-2);
  const prefix = `E-${dd}${mm}${yy}`;

  // mongoose.trusted() is needed because sanitizeFilter is enabled globally,
  // which would otherwise strip the $regex operator from internal queries.
  const lastEnquiry = await Enquiry.findOne({
    enquiryId: mongoose.trusted({ $regex: `^${prefix}` }),
  })
    .sort({ enquiryId: -1 })
    .lean();

  let counter = 1;
  if (lastEnquiry) {
    const lastCounter = parseInt(lastEnquiry.enquiryId.split("-")[2], 10);
    counter = lastCounter + 1;
  }

  if (counter > 999) {
    throw new ConflictError(
      "Daily enquiry limit (999) reached. Please try again tomorrow.",
    );
  }

  return `${prefix}-${String(counter).padStart(3, "0")}`;
}

// ─── Service Functions ──────────────────────────────────────────────────

/**
 * Submit a new enquiry (user-facing).
 * @returns The generated enquiryId string.
 * @throws ConflictError when an active enquiry already exists for the phone number.
 */
export async function createEnquiry(
  input: CreateEnquiryInput,
): Promise<string> {
  await dbConnect();

  // Prevent duplicate open enquiries for the same phone number
  const existingOpen = await Enquiry.findOne({
    phoneNumber: input.phoneNumber,
    currentStatus: mongoose.trusted({ $nin: ["resolved", "closed"] }),
  }).lean();

  if (existingOpen) {
    throw new ConflictError(
      "An active enquiry already exists for this phone number. Please wait for it to be resolved.",
    );
  }

  const enquiryId = await generateEnquiryId();

  const enquiry = await Enquiry.create({
    enquiryId,
    name: input.name,
    phoneNumber: input.phoneNumber,
    query: input.query,
    currentStatus: "new",
  });

  return enquiry.enquiryId;
}

/**
 * List enquiries with pagination and optional status filter (admin-facing).
 * Enriches each enquiry with the latest enqStatus admin info to avoid N+1 where possible.
 */
export async function listEnquiries(
  input: ListEnquiriesInput,
): Promise<PaginatedEnquiries> {
  await dbConnect();

  const { status, page, limit } = input;
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = {};
  if (status && status !== "all") {
    filter.currentStatus = status;
  }

  const [enquiries, total] = await Promise.all([
    Enquiry.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Enquiry.countDocuments(filter),
  ]);

  // Batch-fetch the latest enqStatus for all enquiries in one query
  const enquiryIds = enquiries.map((e) => e._id);
  const latestStatuses = await EnqStatus.aggregate<{
    _id: string;
    adminName: string;
    adminRole: string;
    attemptNumber: number;
  }>([
    { $match: { enquiryId: { $in: enquiryIds } } },
    { $sort: { actionAt: -1 } },
    {
      $group: {
        _id: "$enquiryId",
        adminName: { $first: "$adminName" },
        adminRole: { $first: "$adminRole" },
        attemptNumber: { $first: "$attemptNumber" },
      },
    },
  ]);

  const statusMap = new Map(latestStatuses.map((s) => [String(s._id), s]));

  const enriched: EnrichedEnquiry[] = enquiries.map((enq) => {
    const latest = statusMap.get(String(enq._id));
    return {
      _id: String(enq._id),
      enquiryId: enq.enquiryId,
      name: enq.name,
      phoneNumber: enq.phoneNumber,
      query: enq.query,
      currentStatus: enq.currentStatus,
      firstResponseAt: enq.firstResponseAt,
      resolvedAt: enq.resolvedAt,
      lastActionByAdminName: latest?.adminName ?? null,
      lastActionByAdminRole: latest?.adminRole ?? null,
      lastAttemptNumber: latest?.attemptNumber ?? 0,
      lastActionAt: enq.lastActionAt,
      createdAt: enq.createdAt,
      updatedAt: enq.updatedAt,
    };
  });

  return {
    enquiries: enriched,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Update the status of an enquiry (admin action).
 * Creates an enqStatus audit record and updates the enquiry document atomically
 * within a MongoDB transaction to prevent data inconsistency.
 * @throws NotFoundError when the enquiry ID doesn't exist.
 */
export async function updateEnquiryStatus(
  enquiryDocId: string,
  input: UpdateStatusInput,
): Promise<StatusUpdateResult> {
  await dbConnect();

  const enquiry = await Enquiry.findById(enquiryDocId);
  if (!enquiry) {
    throw new NotFoundError("Enquiry");
  }

  const fromStatus: EnquiryStatus = enquiry.currentStatus;

  // Determine next attempt number
  const lastStatus = await EnqStatus.findOne({ enquiryId: enquiry._id })
    .sort({ attemptNumber: -1 })
    .lean();
  const attemptNumber = (lastStatus?.attemptNumber ?? 0) + 1;

  const now = new Date();

  // Use a transaction to ensure both writes succeed or both fail
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      // Create audit record
      await EnqStatus.create(
        [
          {
            enquiryId: enquiry._id,
            attemptNumber,
            adminId: input.adminId,
            adminName: input.adminName,
            adminRole: input.adminRole,
            fromStatus,
            toStatus: input.toStatus,
            action: input.action,
            notes: input.notes || undefined,
            actionAt: now,
          },
        ],
        { session },
      );

      // Build update payload
      const updateFields: Record<string, unknown> = {
        currentStatus: input.toStatus,
        lastActionByAdminId: input.adminId,
        lastActionAt: now,
      };

      if (fromStatus === "new" && !enquiry.firstResponseAt) {
        updateFields.firstResponseAt = now;
      }
      if (input.toStatus === "resolved") {
        updateFields.resolvedAt = now;
      }

      await Enquiry.findByIdAndUpdate(
        enquiryDocId,
        { $set: updateFields },
        { session },
      );
    });
  } finally {
    await session.endSession();
  }

  return { fromStatus, toStatus: input.toStatus, attemptNumber };
}

/**
 * Fetch the full status-change history for a single enquiry.
 * @throws NotFoundError when the enquiry ID doesn't exist.
 */
export async function getEnquiryStatusHistory(enquiryDocId: string) {
  await dbConnect();

  const enquiry = await Enquiry.findById(enquiryDocId).lean();
  if (!enquiry) {
    throw new NotFoundError("Enquiry");
  }

  return EnqStatus.find({ enquiryId: enquiry._id })
    .sort({ attemptNumber: -1 })
    .lean();
}

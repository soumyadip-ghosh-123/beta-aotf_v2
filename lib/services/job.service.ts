import mongoose from "mongoose";
import dbConnect from "@/lib/db";
import Job, { type IJob } from "@/lib/models/Job";
import { ConflictError, NotFoundError } from "@/lib/errors";
import type {
  CreateJobInput,
  UpdateJobInput,
  ListJobsInput,
} from "@/lib/validations/job";

// ─── Types returned to route handlers ───────────────────────────────────

export interface PaginatedJobs {
  jobs: IJob[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ─── Helpers ────────────────────────────────────────────────────────────

/**
 * Generate a unique job ID in the format `J-DDMMYYNN`.
 * NN is a 2-digit daily counter (00–99).
 */
async function generateJobId(): Promise<string> {
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, "0");
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const yy = String(now.getFullYear()).slice(-2);
  const prefix = `J-${dd}${mm}${yy}`;

  const lastJob = await Job.findOne({
    jobId: mongoose.trusted({ $regex: `^${prefix}` }),
  })
    .sort({ jobId: -1 })
    .lean();

  let counter = 0;
  if (lastJob) {
    const lastCounter = parseInt(lastJob.jobId.slice(-2), 10);
    counter = lastCounter + 1;
  }

  if (counter > 99) {
    throw new ConflictError(
      "Daily job limit (100) reached. Please try again tomorrow.",
    );
  }

  return `${prefix}${String(counter).padStart(2, "0")}`;
}

// ─── Service Functions ──────────────────────────────────────────────────

/**
 * Create a new job post (admin-facing).
 * @returns The created job document.
 */
export async function createJob(input: CreateJobInput): Promise<IJob> {
  await dbConnect();

  const jobId = await generateJobId();

  const job = await Job.create({
    jobId,
    workType: input.workType,
    title: input.title,
    clientName: input.clientName,
    phoneNumber: input.phoneNumber,
    companyType: input.companyType,
    locationType: input.locationType,
    location: input.location,
    timing: input.timing,
    experience: input.experience,
    gender: input.gender,
    salary: input.salary,
    requiredQualification: input.requiredQualification,
    projectType: input.projectType,
    budget: input.budget,
    duration: input.duration,
    brief: input.brief,
    status: input.status ?? "open",
    commissionBasis: input.commissionBasis,
    academyCommissionPercentage: input.academyCommissionPercentage,
    enquiryId: input.enquiryId
      ? new mongoose.Types.ObjectId(input.enquiryId)
      : undefined,
    createdByAdminId: input.createdByAdminId
      ? new mongoose.Types.ObjectId(input.createdByAdminId)
      : undefined,
  });

  return job;
}

/**
 * Get a single job by its jobId field.
 */
export async function getJobByJobId(jobId: string): Promise<IJob> {
  await dbConnect();

  const job = await Job.findOne({ jobId }).lean<IJob>();
  if (!job) {
    throw new NotFoundError("Job");
  }
  return job;
}

/**
 * Get a single job by MongoDB _id.
 */
export async function getJobById(id: string): Promise<IJob> {
  await dbConnect();

  const job = await Job.findById(id).lean<IJob>();
  if (!job) {
    throw new NotFoundError("Job");
  }
  return job;
}

/**
 * List jobs with pagination, optional status filter, and search.
 */
export async function listJobs(input: ListJobsInput): Promise<PaginatedJobs> {
  await dbConnect();

  const { status, page, limit, search } = input;

  // Build filter
  const filter: Record<string, unknown> = {};
  if (status && status !== "all") {
    filter.status = status;
  }
  if (search) {
    const searchRegex = mongoose.trusted({ $regex: search, $options: "i" });
    filter.$or = mongoose.trusted([
      { jobId: searchRegex },
      { title: searchRegex },
      { clientName: searchRegex },
      { phoneNumber: searchRegex },
      { location: searchRegex },
      { requiredQualification: searchRegex },
    ]);
  }

  const [jobs, total] = await Promise.all([
    Job.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean<IJob[]>(),
    Job.countDocuments(filter),
  ]);

  return {
    jobs,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Update a job by jobId.
 */
export async function updateJob(
  jobId: string,
  input: UpdateJobInput,
): Promise<IJob> {
  await dbConnect();

  const updateData: Record<string, unknown> = { ...input };

  // Convert string IDs to ObjectIds
  if (input.updatedByAdminId) {
    updateData.updatedByAdminId = new mongoose.Types.ObjectId(
      input.updatedByAdminId,
    );
  }
  if (input.enquiryId) {
    updateData.enquiryId = new mongoose.Types.ObjectId(input.enquiryId);
  }

  const job = await Job.findOneAndUpdate({ jobId }, updateData, {
    new: true,
    runValidators: true,
  }).lean<IJob>();

  if (!job) {
    throw new NotFoundError("Job");
  }

  return job;
}

/**
 * Delete a job by jobId.
 */
export async function deleteJob(jobId: string): Promise<void> {
  await dbConnect();

  const result = await Job.findOneAndDelete({ jobId });
  if (!result) {
    throw new NotFoundError("Job");
  }
}

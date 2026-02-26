import dbConnect from "@/lib/db";
import Application, { type IApplication } from "@/lib/models/Application";
import { NotFoundError } from "@/lib/errors";

// ─── Types returned to route handlers ───────────────────────────────────

export interface ApplicationListResult {
  applications: IApplication[];
  total: number;
}

// ─── Service Functions ──────────────────────────────────────────────────

/**
 * Get all applications for a tuition post by its postId string (e.g. "P-DDMMYYNN").
 */
export async function getApplicationsByPostId(
  postId: string,
): Promise<ApplicationListResult> {
  await dbConnect();

  const applications = await Application.find({ postId })
    .sort({ appliedAt: -1 })
    .lean();

  return {
    applications: applications as IApplication[],
    total: applications.length,
  };
}

/**
 * Get all applications for a job post by its jobIdPublic string (e.g. "J-DDMMYYNN").
 */
export async function getApplicationsByJobIdPublic(
  jobIdPublic: string,
): Promise<ApplicationListResult> {
  await dbConnect();

  const applications = await Application.find({ jobIdPublic })
    .sort({ appliedAt: -1 })
    .lean();

  return {
    applications: applications as IApplication[],
    total: applications.length,
  };
}

/**
 * Get a single application by its applicationId string.
 */
export async function getApplicationByApplicationId(
  applicationId: string,
): Promise<IApplication> {
  await dbConnect();

  const application = await Application.findOne({ applicationId }).lean();
  if (!application) {
    throw new NotFoundError("Application");
  }

  return application as IApplication;
}

// ─── Delete Functions ───────────────────────────────────────────────────

/**
 * Delete specific applications by their applicationId strings.
 * Returns the count of deleted documents.
 */
export async function deleteApplicationsByIds(
  applicationIds: string[],
): Promise<number> {
  await dbConnect();

  const result = await Application.deleteMany({
    applicationId: { $in: applicationIds },
  });

  return result.deletedCount;
}

/**
 * Delete ALL applications for a tuition post by its postId string.
 * Returns the count of deleted documents.
 */
export async function deleteAllApplicationsByPostId(
  postId: string,
): Promise<number> {
  await dbConnect();

  const result = await Application.deleteMany({ postId });

  return result.deletedCount;
}

/**
 * Delete ALL applications for a job post by its jobIdPublic string.
 * Returns the count of deleted documents.
 */
export async function deleteAllApplicationsByJobIdPublic(
  jobIdPublic: string,
): Promise<number> {
  await dbConnect();

  const result = await Application.deleteMany({ jobIdPublic });

  return result.deletedCount;
}

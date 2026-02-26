import mongoose from "mongoose";
import dbConnect from "@/lib/db";
import Post, { type PostStatus, type IPost } from "@/lib/models/Post";
import { ConflictError, NotFoundError } from "@/lib/errors";
import { escapeRegex } from "@/lib/utils";
import type {
  CreatePostInput,
  UpdatePostInput,
  ListPostsInput,
} from "@/lib/validations/post";

// ─── Types returned to route handlers ───────────────────────────────────

export interface PaginatedPosts {
  posts: IPost[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ─── Helpers ────────────────────────────────────────────────────────────

/**
 * Generate a unique post ID in the format `P-DDMMYYNN`.
 * NN is a 2-digit daily counter (00–99).
 */
async function generatePostId(): Promise<string> {
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, "0");
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const yy = String(now.getFullYear()).slice(-2);
  const prefix = `P-${dd}${mm}${yy}`;

  const lastPost = await Post.findOne({
    postId: mongoose.trusted({ $regex: `^${prefix}` }),
  })
    .sort({ postId: -1 })
    .lean();

  let counter = 0;
  if (lastPost) {
    const lastCounter = parseInt(lastPost.postId.slice(-2), 10);
    counter = lastCounter + 1;
  }

  if (counter > 99) {
    throw new ConflictError(
      "Daily post limit (100) reached. Please try again tomorrow.",
    );
  }

  return `${prefix}${String(counter).padStart(2, "0")}`;
}

/**
 * Normalize subjects to lowercase for search.
 */
function normalizeStudents(
  students: CreatePostInput["students"],
): CreatePostInput["students"] {
  return students.map((s) => ({
    ...s,
    subjectsNormalized: s.subjects.map((sub) => sub.toLowerCase().trim()),
  }));
}

// ─── Service Functions ──────────────────────────────────────────────────

/**
 * Create a new tuition post (admin-facing).
 * @returns The created post document.
 */
export async function createPost(input: CreatePostInput): Promise<IPost> {
  await dbConnect();

  const postId = await generatePostId();
  const students = normalizeStudents(input.students);

  const post = await Post.create({
    postId,
    guardianName: input.guardianName,
    guardianPhone: input.guardianPhone,
    enquiryId: input.enquiryId
      ? new mongoose.Types.ObjectId(input.enquiryId)
      : undefined,
    students,
    classType: input.classType,
    frequencyPerWeek: input.frequencyPerWeek,
    preferredDays: input.preferredDays,
    preferredTime: input.preferredTime,
    location: input.location,
    monthlyBudget: input.monthlyBudget,
    notes: input.notes,
    status: input.status ?? "open",
    createdByAdminId: input.createdByAdminId
      ? new mongoose.Types.ObjectId(input.createdByAdminId)
      : undefined,
  });

  return post;
}

/**
 * Get a single post by postId.
 */
export async function getPostByPostId(postId: string): Promise<IPost> {
  await dbConnect();

  const post = await Post.findOne({ postId }).lean<IPost>();
  if (!post) {
    throw new NotFoundError("Post");
  }
  return post;
}

/**
 * Get a single post by MongoDB _id.
 */
export async function getPostById(id: string): Promise<IPost> {
  await dbConnect();

  const post = await Post.findById(id).lean<IPost>();
  if (!post) {
    throw new NotFoundError("Post");
  }
  return post;
}

/**
 * List posts with pagination, optional status filter, and search.
 */
export async function listPosts(
  input: ListPostsInput,
): Promise<PaginatedPosts> {
  await dbConnect();

  const { status, page, limit, search } = input;

  // Build filter
  const filter: Record<string, unknown> = {};
  if (status && status !== "all") {
    filter.status = status;
  }
  if (search) {
    const searchRegex = mongoose.trusted({
      $regex: escapeRegex(search),
      $options: "i",
    });
    filter.$or = mongoose.trusted([
      { postId: searchRegex },
      { guardianName: searchRegex },
      { guardianPhone: searchRegex },
      { location: searchRegex },
      { "students.className": searchRegex },
      { "students.board": searchRegex },
      { "students.subjectsNormalized": searchRegex },
    ]);
  }

  const [posts, total] = await Promise.all([
    Post.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean<IPost[]>(),
    Post.countDocuments(filter),
  ]);

  return {
    posts,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Update a post by postId.
 */
export async function updatePost(
  postId: string,
  input: UpdatePostInput,
): Promise<IPost> {
  await dbConnect();

  const updateData: Record<string, unknown> = { ...input };

  // Normalize students if provided
  if (input.students) {
    updateData.students = normalizeStudents(input.students);
  }

  // Convert string IDs to ObjectIds
  if (input.updatedByAdminId) {
    updateData.updatedByAdminId = new mongoose.Types.ObjectId(
      input.updatedByAdminId,
    );
  }
  if (input.enquiryId) {
    updateData.enquiryId = new mongoose.Types.ObjectId(input.enquiryId);
  }

  const post = await Post.findOneAndUpdate({ postId }, updateData, {
    new: true,
    runValidators: true,
  }).lean<IPost>();

  if (!post) {
    throw new NotFoundError("Post");
  }

  return post;
}

/**
 * Delete a post by postId.
 */
export async function deletePost(postId: string): Promise<void> {
  await dbConnect();

  const result = await Post.findOneAndDelete({ postId });
  if (!result) {
    throw new NotFoundError("Post");
  }
}

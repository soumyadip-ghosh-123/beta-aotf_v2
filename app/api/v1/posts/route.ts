import { NextRequest, NextResponse } from "next/server";
import {
  handleApiError,
  checkCsrfOrigin,
  checkRateLimit,
  getClientIp,
  checkJsonContentType,
} from "@/lib/api-utils";
import { createPostSchema, listPostsSchema } from "@/lib/validations/post";
import { createPost, listPosts } from "@/lib/services/post.service";
import { createRateLimiter } from "@/lib/rate-limit";

/** 10 post creations per IP per minute */
const createLimiter = createRateLimiter({ windowMs: 60_000, max: 10 });

/** 60 reads per IP per minute */
const readLimiter = createRateLimiter({ windowMs: 60_000, max: 60 });

/**
 * POST /api/v1/posts
 * Admin-facing: create a new tuition post.
 *
 * Request body: CreatePostInput
 *
 * Success 201:
 *   { message: string, post: IPost }
 */
export async function POST(request: NextRequest) {
  try {
    // CSRF origin check
    const csrfBlock = checkCsrfOrigin(request);
    if (csrfBlock) return csrfBlock;

    // Content-Type check
    const ctBlock = checkJsonContentType(request);
    if (ctBlock) return ctBlock;

    // Rate limit
    const ip = getClientIp(request);
    const rateLimitBlock = checkRateLimit(createLimiter, ip);
    if (rateLimitBlock) return rateLimitBlock;

    const body = await request.json();
    const input = createPostSchema.parse(body);
    const post = await createPost(input);

    return NextResponse.json(
      { message: "Post created successfully", post },
      { status: 201 },
    );
  } catch (error) {
    return handleApiError(error, "POST /api/v1/posts");
  }
}

/**
 * GET /api/v1/posts
 * Public/Admin: list posts with pagination, status filter, and search.
 *
 * Query params:
 *   status? — one of the post statuses or "all" (default "all")
 *   page?   — 1-based page number (default 1)
 *   limit?  — items per page, max 100 (default 20)
 *   search? — search term
 *
 * Success 200:
 *   { posts: IPost[], pagination: { page, limit, total, totalPages } }
 */
export async function GET(request: NextRequest) {
  try {
    // Rate limit
    const ip = getClientIp(request);
    const rateLimitBlock = checkRateLimit(readLimiter, ip);
    if (rateLimitBlock) return rateLimitBlock;

    const { searchParams } = new URL(request.url);
    const input = listPostsSchema.parse({
      status: searchParams.get("status") ?? undefined,
      page: searchParams.get("page") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
      search: searchParams.get("search") ?? undefined,
    });

    const result = await listPosts(input);
    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    return handleApiError(error, "GET /api/v1/posts");
  }
}

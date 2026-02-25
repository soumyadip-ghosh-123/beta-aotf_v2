import { NextRequest, NextResponse } from "next/server";
import {
  handleApiError,
  checkCsrfOrigin,
  checkRateLimit,
  getClientIp,
} from "@/lib/api-utils";
import { updatePostSchema } from "@/lib/validations/post";
import {
  getPostByPostId,
  updatePost,
  deletePost,
} from "@/lib/services/post.service";
import { createRateLimiter } from "@/lib/rate-limit";

/** 60 reads per IP per minute */
const readLimiter = createRateLimiter({ windowMs: 60_000, max: 60 });

/** 20 mutations per IP per minute */
const mutateLimiter = createRateLimiter({ windowMs: 60_000, max: 20 });

/**
 * GET /api/posts/[postId]
 * Get a single post by its postId.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> },
) {
  try {
    // Rate limit
    const ip = getClientIp(request);
    const rateLimitBlock = checkRateLimit(readLimiter, ip);
    if (rateLimitBlock) return rateLimitBlock;

    const { postId } = await params;
    const post = await getPostByPostId(postId);
    return NextResponse.json(
      { post },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      },
    );
  } catch (error) {
    return handleApiError(error, `GET /api/posts/${(await params).postId}`);
  }
}

/**
 * PATCH /api/posts/[postId]
 * Admin-facing: update a post.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> },
) {
  try {
    const csrfBlock = checkCsrfOrigin(request);
    if (csrfBlock) return csrfBlock;

    // Rate limit
    const ip = getClientIp(request);
    const rateLimitBlock = checkRateLimit(mutateLimiter, ip);
    if (rateLimitBlock) return rateLimitBlock;

    const { postId } = await params;
    const body = await request.json();
    const input = updatePostSchema.parse(body);
    const post = await updatePost(postId, input);

    return NextResponse.json({
      message: "Post updated successfully",
      post,
    });
  } catch (error) {
    return handleApiError(error, `PATCH /api/posts/${(await params).postId}`);
  }
}

/**
 * DELETE /api/posts/[postId]
 * Admin-facing: delete a post.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> },
) {
  try {
    const csrfBlock = checkCsrfOrigin(request);
    if (csrfBlock) return csrfBlock;

    // Rate limit
    const ipDel = getClientIp(request);
    const rateLimitBlockDel = checkRateLimit(mutateLimiter, ipDel);
    if (rateLimitBlockDel) return rateLimitBlockDel;

    const { postId } = await params;
    await deletePost(postId);

    return NextResponse.json({ message: "Post deleted successfully" });
  } catch (error) {
    return handleApiError(error, `DELETE /api/posts/${(await params).postId}`);
  }
}

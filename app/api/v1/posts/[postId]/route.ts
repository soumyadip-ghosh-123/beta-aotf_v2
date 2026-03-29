import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import {
  handleApiError,
  checkCsrfOrigin,
  checkRateLimit,
  getClientIp,
  checkJsonContentType,
} from "@/lib/api-utils";
import Admin from "@/lib/models/Admin";
import dbConnect from "@/lib/db";
import { updatePostSchema } from "@/lib/validations/post";
import {
  getPostByPostId,
  updatePost,
  deletePost,
} from "@/lib/services/post.service";
import { upsertPostLedger } from "@/lib/services/postLedger.service";
import { createRateLimiter } from "@/lib/rate-limit";
import { postIdParamSchema } from "@/lib/validations/api-route";

/** 60 reads per IP per minute */
const readLimiter = createRateLimiter({ windowMs: 60_000, max: 60 });

/** 20 mutations per IP per minute */
const mutateLimiter = createRateLimiter({ windowMs: 60_000, max: 20 });

/**
 * GET /api/v1/posts/[postId]
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

    const { postId } = postIdParamSchema.parse(await params);
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
    return handleApiError(error, `GET /api/v1/posts/${(await params).postId}`);
  }
}

/**
 * PATCH /api/v1/posts/[postId]
 * Admin-facing: update a post.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> },
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const csrfBlock = checkCsrfOrigin(request);
    if (csrfBlock) return csrfBlock;

    // Content-Type check
    const ctBlock = checkJsonContentType(request);
    if (ctBlock) return ctBlock;

    // Rate limit
    const ip = getClientIp(request);
    const rateLimitBlock = checkRateLimit(mutateLimiter, ip);
    if (rateLimitBlock) return rateLimitBlock;

    await dbConnect();
    const currentAdmin = await Admin.findOne({ clerkId: userId }).lean();
    if (!currentAdmin) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 },
      );
    }

    const { postId } = postIdParamSchema.parse(await params);
    const body = await request.json();
    const input = updatePostSchema.parse(body);
    const post = await updatePost(postId, {
      ...input,
      updatedByAdminClerkId: currentAdmin.clerkId,
    });

    await upsertPostLedger(postId);

    return NextResponse.json({
      message: "Post updated successfully",
      post,
    });
  } catch (error) {
    return handleApiError(
      error,
      `PATCH /api/v1/posts/${(await params).postId}`,
    );
  }
}

/**
 * DELETE /api/v1/posts/[postId]
 * Admin-facing: delete a post.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> },
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const csrfBlock = checkCsrfOrigin(request);
    if (csrfBlock) return csrfBlock;

    // Rate limit
    const ipDel = getClientIp(request);
    const rateLimitBlockDel = checkRateLimit(mutateLimiter, ipDel);
    if (rateLimitBlockDel) return rateLimitBlockDel;

    await dbConnect();
    const currentAdmin = await Admin.findOne({ clerkId: userId }).lean();
    if (!currentAdmin) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 },
      );
    }

    const { postId } = postIdParamSchema.parse(await params);
    await deletePost(postId);

    return NextResponse.json({ message: "Post deleted successfully" });
  } catch (error) {
    return handleApiError(
      error,
      `DELETE /api/v1/posts/${(await params).postId}`,
    );
  }
}

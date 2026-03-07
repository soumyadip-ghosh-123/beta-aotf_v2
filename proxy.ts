import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { NextFetchEvent } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/lib/models/User";

// ─── Route matchers ─────────────────────────────────────────────────────

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/admin/login(.*)",
  "/api/v1/webhooks(.*)",
  "/about(.*)",
  "/contact(.*)",
  "/enquiry(.*)",
  "/jobs(.*)",
  "/posts(.*)",
  "/privacy-policy(.*)",
  "/refund-policy(.*)",
  "/terms(.*)",
  "/services(.*)",
  "/sso-callback(.*)",
  "/verify(.*)",
]);

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);
const isOnboardingRoute = createRouteMatcher(["/onboarding"]);
const isUserProfileRoute = createRouteMatcher(["/u(.*)"]);
// API routes called during onboarding — must be reachable before onboarding is complete
const isOnboardingApiRoute = createRouteMatcher([
  "/api/v1/profile(.*)",
  "/api/v1/onboarding(.*)",
  "/api/v1/payments(.*)",
  "/api/v1/users(.*)",
]);
// ─── Clerk middleware instance ───────────────────────────────────────

const middleware = clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth();
  const meta = sessionClaims?.publicMetadata as
    | Record<string, unknown>
    | undefined;

  const { pathname } = req.nextUrl;
  const method = req.method;
  const start = Date.now();
  // 0. /dashboard/redirect → /u/[username]/dashboard
  // username is NOT in the Clerk JWT by default, so we always look it up from DB.
  if (pathname === "/dashboard/redirect" && userId) {
    try {
      await dbConnect();
      const userDoc = await User.findOne(
        { clerkId: userId },
        { username: 1, onboardingCompleted: 1 },
      ).lean();

      if (userDoc?.onboardingCompleted && userDoc?.username) {
        return NextResponse.redirect(
          new URL(`/u/${userDoc.username}/profile`, req.url),
        );
      }
      // Payment not completed yet — send to onboarding
      return NextResponse.redirect(new URL("/onboarding", req.url));
    } catch {
      // DB unreachable — send to home as safe fallback
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // 1. Admin route guard
  if (isAdminRoute(req) && !isPublicRoute(req)) {
    if (!userId || meta?.isAdmin !== true) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // 2. Auth guard for all protected routes
  if (!isPublicRoute(req) && !userId) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }
  // 3. Onboarding gate — JWT claim first, DB fallback if claim is absent
  if (
    userId &&
    !isPublicRoute(req) &&
    !isAdminRoute(req) &&
    !isOnboardingRoute(req) &&
    !isOnboardingApiRoute(req) &&
    !isUserProfileRoute(req)
  ) {
    // Fast path: JWT already carries the flag (normal case after first login
    // post-payment, or after Clerk propagates the metadata update).
    if (meta?.onboardingCompleted === true) {
      // allowed through — fall to NextResponse.next() below
    } else {
      // Slow path: JWT claim is missing or stale (happens on the first re-login
      // after payment because Clerk issues the session token before the
      // publicMetadata update propagates). Check the DB as the source of truth.
      try {
        await dbConnect();
        const userDoc = await User.findOne(
          { clerkId: userId },
          { onboardingCompleted: 1 },
        ).lean();

        if (!userDoc?.onboardingCompleted) {
          return NextResponse.redirect(new URL("/onboarding", req.url));
        }
        // DB says completed — let the user through. Clerk metadata will catch
        // up on the next token refresh and the slow path won't be needed again.
      } catch {
        // If the DB is unreachable, fall back to the JWT claim to avoid
        // blocking the user with a redirect loop.
        if (meta?.onboardingCompleted !== true) {
          return NextResponse.redirect(new URL("/onboarding", req.url));
        }
      }
    }
  }

  // 4. Request logging for API routes
  if (pathname.startsWith("/api/")) {
    const duration = Date.now() - start;
    console.log(`[${method}] ${pathname} — ${duration}ms`);
  }

  return NextResponse.next();
});

// ─── Proxy ───────────────────────────────────────────────────────────

export async function proxy(request: NextRequest) {
  // Bypass clerkMiddleware entirely for webhook routes.
  // clerkMiddleware rebuilds the request Headers object internally, which
  // strips the svix-id / svix-timestamp / svix-signature headers that
  // Clerk attaches to every webhook delivery. Those headers must reach
  // the route handler intact so verifyWebhook() can authenticate the call.
  if (request.nextUrl.pathname.startsWith("/api/v1/webhooks/")) {
    return NextResponse.next();
  }

  const event = {
    sourcePage: "/",
    waitUntil: () => { },
    passThroughOnException: () => { },
  } as unknown as NextFetchEvent;

  return middleware(request, event);
}

// ─── Matcher ────────────────────────────────────────────────────────────

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};

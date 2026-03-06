import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { NextFetchEvent } from "next/server";

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
// ─── Clerk middleware instance ───────────────────────────────────────

const middleware = clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth();
  const meta = sessionClaims?.publicMetadata as
    | Record<string, unknown>
    | undefined;

  const { pathname } = req.nextUrl;
  const method = req.method;
  const start = Date.now();

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

  // 3. Onboarding gate — JWT claim only, no DB query
  if (
    userId &&
    !isPublicRoute(req) &&
    !isAdminRoute(req) &&
    !isOnboardingRoute(req)
  ) {
    if (meta?.onboardingCompleted !== true) {
      return NextResponse.redirect(new URL("/onboarding", req.url));
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
    waitUntil: () => {},
    passThroughOnException: () => {},
  } as unknown as NextFetchEvent;

  return middleware(request, event);
}

// ─── Matcher ────────────────────────────────────────────────────────────

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};

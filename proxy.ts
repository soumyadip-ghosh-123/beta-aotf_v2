import { NextRequest, NextResponse } from "next/server";

/**
 * Next.js Proxy — runs on the Node.js runtime at the start of every matched request.
 *
 * Responsibilities:
 *  1. Request logging (method, path, duration)
 *  2. Auth guard placeholder for admin API routes
 *     → Once an auth library (NextAuth / Clerk / etc.) is integrated,
 *       uncomment the session check below.
 *
 * NOTE: CSRF and rate limiting are still handled per-route because they
 * require more nuanced configuration (different limits, mutation-only CSRF).
 *
 * @see https://nextjs.org/docs/app/building-your-application/routing/proxy
 */

// ─── Admin-protected API route patterns ─────────────────────────────────

/** Routes that require authentication (mutations + admin reads) */
const ADMIN_ROUTE_PATTERNS = [
  /^\/api\/v1\/posts$/, // POST (create)
  /^\/api\/v1\/posts\/[^/]+$/, // PATCH / DELETE (update / delete)
  /^\/api\/v1\/enquiry\/[^/]+\/status$/, // PATCH (status update)
  /^\/api\/v1\/enquiry$/, // GET (admin list)
];

/** HTTP methods that are always admin-only on the matched routes */
const ADMIN_METHODS = new Set(["POST", "PATCH", "DELETE"]);

function isAdminRoute(pathname: string, method: string): boolean {
  // GET /api/v1/enquiry is admin-only (list enquiries)
  if (pathname === "/api/v1/enquiry" && method === "GET") return true;

  // All mutations on protected patterns
  if (!ADMIN_METHODS.has(method)) return false;

  return ADMIN_ROUTE_PATTERNS.some((pattern) => pattern.test(pathname));
}

// ─── Proxy ───────────────────────────────────────────────────────────

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method;
  const start = Date.now();

  // ── Auth guard (placeholder) ─────────────────────────────────────────
  // TODO: Uncomment & adapt once an auth library is installed.
  //
  // if (isAdminRoute(pathname, method)) {
  //   const session = await getAuthSession(request); // replace with your auth check
  //   if (!session) {
  //     return NextResponse.json(
  //       { error: "Authentication required" },
  //       { status: 401 },
  //     );
  //   }
  //   // Optionally check roles:
  //   // if (!["admin", "super_admin"].includes(session.user.role)) {
  //   //   return NextResponse.json(
  //   //     { error: "Insufficient permissions" },
  //   //     { status: 403 },
  //   //   );
  //   // }
  // }

  const response = NextResponse.next();

  // ── Request logging ──────────────────────────────────────────────────
  // Only log API requests to keep noise down
  if (pathname.startsWith("/api/")) {
    const duration = Date.now() - start;
    console.log(`[${method}] ${pathname} — ${duration}ms`);
  }

  return response;
}

// ─── Matcher ────────────────────────────────────────────────────────────

/**
 * Run proxy on API routes only.
 * Adjust the matcher array if you need it on page routes (e.g. auth redirects).
 */
export const config = {
  matcher: ["/api/:path*"],
};

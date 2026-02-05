import { NextRequest, NextResponse } from "next/server";
import { AppError, ValidationError } from "@/lib/errors";

/** Standard shape returned by every error response */
interface ErrorResponse {
  error: string;
  fieldErrors?: Record<string, string[]>;
}

// ─── CSRF Origin Check ──────────────────────────────────────────────────

/**
 * Validate that the request `Origin` or `Referer` header matches the
 * application host. This prevents cross-site POST/PATCH/DELETE requests
 * from malicious pages.
 *
 * Returns `null` if the check passes, or a 403 NextResponse to return
 * immediately if it fails.
 */
export function checkCsrfOrigin(request: NextRequest): NextResponse | null {
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const host = request.headers.get("host");

  // At least one of origin or referer must be present
  if (!origin && !referer) {
    return NextResponse.json(
      { error: "Forbidden: missing origin" },
      { status: 403 },
    );
  }

  const allowed = host ? [host] : [];

  // Also allow configured app URL (e.g. "https://myapp.com")
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (appUrl) {
    try {
      allowed.push(new URL(appUrl).host);
    } catch {
      // ignore malformed URL
    }
  }

  // Always allow localhost variants in development
  if (process.env.NODE_ENV === "development") {
    allowed.push("localhost:3000", "127.0.0.1:3000");
  }

  const originHost = origin ? safeHost(origin) : null;
  const refererHost = referer ? safeHost(referer) : null;
  const sourceHost = originHost ?? refererHost;

  if (!sourceHost || !allowed.includes(sourceHost)) {
    return NextResponse.json(
      { error: "Forbidden: origin mismatch" },
      { status: 403 },
    );
  }

  return null; // passed
}

function safeHost(url: string): string | null {
  try {
    return new URL(url).host;
  } catch {
    return null;
  }
}

// ─── Client IP Extraction ───────────────────────────────────────────────

/** Extract the client IP from common proxy headers, falling back to "unknown". */
export function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

// ─── Rate-Limit Response Helper ─────────────────────────────────────────

import type { createRateLimiter } from "@/lib/rate-limit";

/**
 * Check rate limit and return a 429 response if exceeded, or `null` if OK.
 * Adds standard `Retry-After` and `X-RateLimit-*` headers on both paths.
 */
export function checkRateLimit(
  limiter: ReturnType<typeof createRateLimiter>,
  key: string,
): NextResponse | null {
  const result = limiter.check(key);

  if (!result.allowed) {
    const retryAfterSec = Math.ceil((result.resetAt - Date.now()) / 1000);
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": String(retryAfterSec),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(result.resetAt),
        },
      },
    );
  }

  return null; // within limit
}

/** Type guard for Zod errors (works across Zod v3 and v4) */
function isZodError(
  err: unknown,
): err is { issues: { path: (string | number)[]; message: string }[] } {
  return (
    typeof err === "object" &&
    err !== null &&
    "issues" in err &&
    Array.isArray((err as { issues: unknown }).issues)
  );
}

/**
 * Centralised error-to-response mapper.
 * - ZodError → 400 with per-field messages
 * - AppError subclasses → their own statusCode
 * - Mongoose duplicate key → 409
 * - Everything else → generic 500 (no internal leaks)
 */
export function handleApiError(
  error: unknown,
  context?: string,
): NextResponse<ErrorResponse> {
  // Log with context for debugging server-side
  if (context) {
    console.error(`[${context}]`, error);
  } else {
    console.error(error);
  }

  // ── Zod validation ─────────────────────────────────────────────────
  if (isZodError(error)) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of error.issues) {
      const key = issue.path.join(".");
      (fieldErrors[key] ??= []).push(issue.message);
    }
    return NextResponse.json(
      { error: "Validation failed", fieldErrors },
      { status: 400 },
    );
  }

  // ── Known operational errors ───────────────────────────────────────
  if (error instanceof ValidationError) {
    return NextResponse.json(
      { error: error.message, fieldErrors: error.fieldErrors },
      { status: error.statusCode },
    );
  }

  if (error instanceof AppError) {
    return NextResponse.json(
      { error: error.message },
      { status: error.statusCode },
    );
  }

  // ── Mongoose duplicate key ─────────────────────────────────────────
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: number }).code === 11000
  ) {
    return NextResponse.json(
      { error: "A duplicate entry was detected. Please try again." },
      { status: 409 },
    );
  }

  // ── Catch-all (never leak internals) ───────────────────────────────
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}

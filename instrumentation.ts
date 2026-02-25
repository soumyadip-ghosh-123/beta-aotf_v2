/**
 * Next.js Instrumentation Hook
 * ----------------------------
 * Runs once when the Next.js server boots — before any request is handled.
 * We use it to:
 *  1. Validate required environment variables
 *  2. Eagerly open the MongoDB connection so the first request
 *     never has to wait for an Atlas free-tier cold start.
 *
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */
export async function onRequestError() {
  // intentionally empty — must be exported for Next.js to load this file
}

/** Required environment variables — fail fast if any are missing. */
const REQUIRED_ENV_VARS = ["MONGODB_URI"] as const;

function validateEnv() {
  const missing = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(
      `[env] Missing required environment variables: ${missing.join(", ")}`,
    );
  }
  console.log("[instrumentation] Environment variables validated ✓");
}

export async function register() {
  // Only run on the Node.js server runtime,
  // not on the Edge runtime or during build.
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // 1. Validate env vars — crash early if misconfigured
    validateEnv();

    // 2. Warm the DB connection
    try {
      const { default: dbConnect } = await import("@/lib/db");
      await dbConnect();
      console.log("[instrumentation] MongoDB connection warmed ✓");
    } catch (err) {
      // Log but don't crash the server — dbConnect will retry on first request
      console.error("[instrumentation] MongoDB warm-up failed:", err);
    }
  }
}

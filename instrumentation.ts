/**
 * Next.js Instrumentation Hook
 * ----------------------------
 * Runs once when the Next.js server boots — before any request is handled.
 * We use it to eagerly open the MongoDB connection so the first user-facing
 * request never has to wait (or fail) due to an Atlas free-tier cold start.
 *
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */
export async function onRequestError() {
  // intentionally empty — must be exported for Next.js to load this file
}

export async function register() {
  // Only warm the connection on the Node.js server runtime,
  // not on the Edge runtime or during build.
  if (process.env.NEXT_RUNTIME === "nodejs") {
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

import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { version } from "@/package.json";

// Force this route to be dynamic so it always runs fresh (never cached)
export const dynamic = "force-dynamic";

/**
 * GET /api/health
 *
 * Lightweight health-check endpoint. Returns the DB connection state,
 * process uptime, and the application version.
 *
 * Intended for:
 *   - Vercel health checks / uptime monitors
 *   - CI smoke tests after deployment
 *   - Manual confirmation that the server + DB are reachable
 *
 * Response shape:
 * {
 *   status:    "ok" | "degraded",
 *   db:        "connected" | "disconnected",
 *   uptime:    number,   // seconds since process start
 *   version:   string,   // from package.json
 *   timestamp: string,   // ISO-8601
 * }
 *
 * HTTP status codes:
 *   200 — server is up; DB may or may not be reachable (check `db` field)
 *   503 — server is up but DB is confirmed unreachable after retries
 */
export async function GET() {
  const timestamp = new Date().toISOString();
  const uptime = Math.floor(process.uptime());

  let dbStatus: "connected" | "disconnected" = "disconnected";
  let httpStatus = 503;

  try {
    // Uses the cached connection when warm; retries on cold start
    await dbConnect();
    dbStatus = "connected";
    httpStatus = 200;
  } catch {
    // DB unreachable — still return a response so monitors know the app is alive
    dbStatus = "disconnected";
  }

  return NextResponse.json(
    {
      status: dbStatus === "connected" ? "ok" : "degraded",
      db: dbStatus,
      uptime,
      version: version ?? "unknown",
      timestamp,
    },
    { status: httpStatus },
  );
}

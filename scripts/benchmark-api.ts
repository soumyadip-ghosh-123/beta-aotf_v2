/**
 * AOTF API Performance Benchmark Script
 *
 * Hits every documented API endpoint and records response times.
 *
 * Usage:
 *   BASE_URL=http://localhost:3000 AUTH_TOKEN=<clerk_jwt> ADMIN_TOKEN=<admin_clerk_jwt> \
 *     pnpm tsx scripts/benchmark-api.ts
 *
 * Options (env vars):
 *   BASE_URL    — Target server (default: http://localhost:3000)
 *   AUTH_TOKEN  — Clerk JWT for authenticated provider routes
 *   ADMIN_TOKEN — Clerk JWT for admin-only routes
 *   RUNS        — Number of times to hit each endpoint (default: 3, reports median)
 *   OUTPUT      — Path to write JSON results (default: scripts/benchmark-results.json)
 *   QUIET       — Set to "1" to suppress per-request logs
 */

import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";
const AUTH_TOKEN = process.env.AUTH_TOKEN ?? "";
const ADMIN_TOKEN = process.env.ADMIN_TOKEN ?? "";
const RUNS = Math.max(1, parseInt(process.env.RUNS ?? "3", 10));
const OUTPUT = process.env.OUTPUT ?? path.join(__dirname, "benchmark-results.json");
const QUIET = process.env.QUIET === "1";

// ─── Endpoint Definitions ─────────────────────────────────────────────────────

interface Endpoint {
  label: string;
  method: "GET" | "POST" | "PATCH" | "DELETE";
  path: string;
  auth: "none" | "user" | "admin";
  body?: Record<string, unknown>;
  expectedStatus?: number;
}

const endpoints: Endpoint[] = [
  // Health (public)
  { label: "Health Check", method: "GET", path: "/api/health", auth: "none", expectedStatus: 200 },

  // Public reads
  { label: "List Posts", method: "GET", path: "/api/v1/posts?page=1&limit=10", auth: "none", expectedStatus: 200 },
  { label: "List Jobs", method: "GET", path: "/api/v1/jobs?page=1&limit=10", auth: "none", expectedStatus: 200 },
  { label: "Renowned Teachers", method: "GET", path: "/api/v1/renowned-teachers", auth: "none", expectedStatus: 200 },
  { label: "Docs Search", method: "GET", path: "/api/search?q=admin", auth: "none", expectedStatus: 200 },

  // Authenticated user routes
  { label: "Get Me", method: "GET", path: "/api/v1/me", auth: "user", expectedStatus: 200 },
  { label: "Get Own Profile", method: "GET", path: "/api/v1/profile", auth: "user", expectedStatus: 200 },

  // Admin-only routes
  { label: "List Users (admin)", method: "GET", path: "/api/v1/users?page=1&limit=10", auth: "admin", expectedStatus: 200 },
  { label: "List Enquiries (admin)", method: "GET", path: "/api/v1/enquiry?page=1&limit=10", auth: "admin", expectedStatus: 200 },
  { label: "List Admins (admin)", method: "GET", path: "/api/v1/admin/admins", auth: "admin", expectedStatus: 200 },
  { label: "Calendar Events (admin)", method: "GET", path: "/api/v1/admin/calendar", auth: "admin", expectedStatus: 200 },

  // OpenAPI spec
  { label: "OpenAPI Spec", method: "GET", path: "/api/openapi.json", auth: "none", expectedStatus: 200 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getAuthHeader(auth: Endpoint["auth"]): Record<string, string> {
  if (auth === "admin" && ADMIN_TOKEN) return { Authorization: `Bearer ${ADMIN_TOKEN}` };
  if (auth === "user" && AUTH_TOKEN) return { Authorization: `Bearer ${AUTH_TOKEN}` };
  return {};
}

async function hitEndpoint(ep: Endpoint): Promise<{ status: number; ms: number }> {
  const url = `${BASE_URL}${ep.path}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Origin: BASE_URL,
    ...getAuthHeader(ep.auth),
  };

  const start = performance.now();
  let status = 0;
  try {
    const res = await fetch(url, {
      method: ep.method,
      headers,
      body: ep.body ? JSON.stringify(ep.body) : undefined,
    });
    status = res.status;
  } catch (err) {
    status = -1; // Network error
  }
  const ms = Math.round(performance.now() - start);
  return { status, ms };
}

function median(arr: number[]): number {
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid]! : Math.round((sorted[mid - 1]! + sorted[mid]!) / 2);
}

function pad(str: string, len: number): string {
  return str.padEnd(len, " ");
}

// ─── Main ─────────────────────────────────────────────────────────────────────

interface BenchmarkResult {
  label: string;
  method: string;
  path: string;
  auth: string;
  runs: number;
  medianMs: number;
  minMs: number;
  maxMs: number;
  lastStatus: number;
  expectedStatus: number;
  passed: boolean;
}

async function main() {
  console.log(`\n🔬 AOTF API Benchmark — ${BASE_URL}`);
  console.log(`   Runs per endpoint: ${RUNS}`);
  console.log(`   Endpoints: ${endpoints.length}`);
  if (!AUTH_TOKEN) console.warn("   ⚠  AUTH_TOKEN not set — user routes will return 401");
  if (!ADMIN_TOKEN) console.warn("   ⚠  ADMIN_TOKEN not set — admin routes will return 401\n");

  const results: BenchmarkResult[] = [];

  for (const ep of endpoints) {
    const timings: number[] = [];
    let lastStatus = 0;

    for (let i = 0; i < RUNS; i++) {
      const { status, ms } = await hitEndpoint(ep);
      timings.push(ms);
      lastStatus = status;
      if (!QUIET) {
        process.stdout.write(`  [${i + 1}/${RUNS}] ${ep.label} → ${status} (${ms}ms)\r`);
      }
    }

    const med = median(timings);
    const min = Math.min(...timings);
    const max = Math.max(...timings);
    const expected = ep.expectedStatus ?? 200;
    const passed = lastStatus === expected || (ep.auth !== "none" && lastStatus === 401);

    results.push({
      label: ep.label,
      method: ep.method,
      path: ep.path,
      auth: ep.auth,
      runs: RUNS,
      medianMs: med,
      minMs: min,
      maxMs: max,
      lastStatus,
      expectedStatus: expected,
      passed,
    });
  }

  // ─── Print table ─────────────────────────────────────────────────────────
  console.log("\n");
  const COL = [32, 8, 12, 10, 10, 8, 6];
  const header = [
    pad("Endpoint", COL[0]!),
    pad("Method", COL[1]!),
    pad("Median", COL[2]!),
    pad("Min", COL[3]!),
    pad("Max", COL[4]!),
    pad("Status", COL[5]!),
    pad("Pass", COL[6]!),
  ].join("│");
  const divider = COL.map((c) => "─".repeat(c)).join("┼");
  console.log(`┌${divider.replace(/┼/g, "┬")}┐`);
  console.log(`│${header}│`);
  console.log(`├${divider}┤`);
  for (const r of results) {
    const row = [
      pad(r.label.slice(0, COL[0]! - 1), COL[0]!),
      pad(r.method, COL[1]!),
      pad(`${r.medianMs}ms`, COL[2]!),
      pad(`${r.minMs}ms`, COL[3]!),
      pad(`${r.maxMs}ms`, COL[4]!),
      pad(String(r.lastStatus), COL[5]!),
      pad(r.passed ? "✅" : "❌", COL[6]!),
    ].join("│");
    console.log(`│${row}│`);
  }
  console.log(`└${divider.replace(/┼/g, "┴")}┘`);

  const passed = results.filter((r) => r.passed).length;
  const avgMedian = Math.round(results.reduce((s, r) => s + r.medianMs, 0) / results.length);
  console.log(`\n✅ ${passed}/${results.length} endpoints passed   |   Avg median: ${avgMedian}ms`);

  // ─── Write JSON output ────────────────────────────────────────────────────
  const output = {
    timestamp: new Date().toISOString(),
    baseUrl: BASE_URL,
    runs: RUNS,
    summary: { total: results.length, passed, avgMedianMs: avgMedian },
    results,
  };
  await fs.writeFile(OUTPUT, JSON.stringify(output, null, 2), "utf8");
  console.log(`\n📄 Results written to: ${OUTPUT}\n`);
}

main().catch((err) => {
  console.error("Benchmark failed:", err);
  process.exit(1);
});

"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { SuperAdminPayload } from "@/components/admin/dashboard/SuperAdminDashboard";
import type { AdminPayload } from "@/components/admin/dashboard/AdminDashboard";
import type { SupportAdminPayload } from "@/components/admin/dashboard/SupportAdminDashboard";

// Lazy-load dashboard views — code split so each role only loads its bundle
const SuperAdminDashboard = dynamic(
  () => import("@/components/admin/dashboard/SuperAdminDashboard"),
  { ssr: false }
);
const AdminDashboard = dynamic(
  () => import("@/components/admin/dashboard/AdminDashboard"),
  { ssr: false }
);
const SupportAdminDashboard = dynamic(
  () => import("@/components/admin/dashboard/SupportAdminDashboard"),
  { ssr: false }
);

// ─── Types ──────────────────────────────────────────────────────────────────

type DashboardPayload = SuperAdminPayload | AdminPayload | SupportAdminPayload;

// ─── Skeleton ───────────────────────────────────────────────────────────────

function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Stat cards skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-5 h-32">
            <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 mb-3" />
            <div className="h-3 w-24 rounded bg-zinc-100 dark:bg-zinc-800 mb-2" />
            <div className="h-7 w-16 rounded bg-zinc-100 dark:bg-zinc-800" />
          </div>
        ))}
      </div>
      {/* Body skeleton */}
      <div className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 h-56" />
        ))}
      </div>
    </div>
  );
}

// ─── Role label helpers ──────────────────────────────────────────────────────

function getRoleLabel(role: string) {
  switch (role) {
    case "super_admin":   return "Super Admin";
    case "admin":         return "Sub-Superadmin";
    case "support_admin": return "Support Admin";
    default:              return role;
  }
}

function getRoleBadge(role: string) {
  switch (role) {
    case "super_admin":
      return "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800";
    case "admin":
      return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800";
    case "support_admin":
      return "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800";
    default:
      return "bg-zinc-100 text-zinc-700 border-zinc-200";
  }
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function AdminHomePage() {
  const { user, isLoaded: clerkLoaded } = useUser();
  const [payload, setPayload] = useState<DashboardPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!clerkLoaded || !user) return;

    const fetchDashboard = async () => {
      try {
        const res = await fetch("/api/v1/admin/dashboard");
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error ?? `HTTP ${res.status}`);
        }
        const data = await res.json();
        setPayload(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load dashboard");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, [clerkLoaded, user]);

  // ── Greeting ──
  const meta  = user?.publicMetadata as Record<string, unknown> | undefined;
  const role  = (meta?.role as string) ?? "";
  const name  = (user?.firstName ?? "Admin");

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">

      {/* ── Page header ── */}
      <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Welcome back, {name}!
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Here&apos;s what&apos;s happening on your platform today.
          </p>
        </div>
        {role && (
          <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${getRoleBadge(role)}`}>
            {getRoleLabel(role)}
          </span>
        )}
      </div>

      {/* ── Content ── */}
      {isLoading || !clerkLoaded ? (
        <DashboardSkeleton />
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 p-6 text-center">
          <p className="text-sm font-medium text-red-700 dark:text-red-400">Failed to load dashboard</p>
          <p className="text-xs text-red-500 mt-1">{error}</p>
          <button
            onClick={() => { setIsLoading(true); setError(null); }}
            className="mt-4 text-xs text-red-600 underline hover:no-underline"
          >
            Try again
          </button>
        </div>
      ) : payload?.role === "super_admin" ? (
        <SuperAdminDashboard data={payload} />
      ) : payload?.role === "admin" ? (
        <AdminDashboard data={payload} />
      ) : payload?.role === "support_admin" ? (
        <SupportAdminDashboard data={payload} />
      ) : null}
    </div>
  );
}

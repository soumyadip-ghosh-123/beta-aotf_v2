"use client";

import React from "react";
import Link from "next/link";
import {
  BookOpen,
  MessageSquare,
  ArrowUpRight,
  Clock,
  Activity,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface AdminPayload {
  role: "admin";
  stats: {
    activePosts: number;
    enquiries: { new: number; inProgress: number; total: number };
  };
  postsByStatus: Record<string, number>;
  recentEnquiries: Array<{
    _id: string;
    name: string;
    query: string;
    currentStatus: string;
    createdAt: string;
  }>;
  myActivity: {
    postsCreated: number;
    enquiriesHandled: number;
  };
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return new Intl.NumberFormat("en-IN").format(n);
}

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);
  if (mins  < 1)  return "just now";
  if (mins  < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

const STATUS_COLORS: Record<string, string> = {
  open:        "bg-blue-100   text-blue-700   dark:bg-blue-900/40   dark:text-blue-300",
  matched:     "bg-green-100  text-green-700  dark:bg-green-900/40  dark:text-green-300",
  closed:      "bg-zinc-100   text-zinc-600   dark:bg-zinc-800      dark:text-zinc-400",
  cancelled:   "bg-red-100    text-red-700    dark:bg-red-900/40    dark:text-red-300",
  hold:        "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
  new:         "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",
  in_progress: "bg-amber-100  text-amber-700  dark:bg-amber-900/40  dark:text-amber-300",
  contacted:   "bg-cyan-100   text-cyan-700   dark:bg-cyan-900/40   dark:text-cyan-300",
  resolved:    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ${STATUS_COLORS[status] ?? "bg-zinc-100 text-zinc-600"}`}>
      {status.replace("_", " ")}
    </span>
  );
}

// ─── Stat Card ──────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  accent,
  href,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  accent: string;
  href?: string;
}) {
  const inner = (
    <div className="relative rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-5 shadow-sm transition-shadow hover:shadow-md overflow-hidden group">
      <div className={`absolute -top-4 -right-4 w-20 h-20 rounded-full opacity-10 ${accent}`} />
      <div className={`mb-3 inline-flex items-center justify-center w-10 h-10 rounded-xl ${accent} bg-opacity-15`}>
        <Icon size={18} className="text-inherit opacity-80" />
      </div>
      <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-0.5">{label}</p>
      <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">{value}</p>
      {sub && <p className="mt-1 text-[11px] text-zinc-400 dark:text-zinc-500">{sub}</p>}
      {href && (
        <ArrowUpRight size={14} className="absolute bottom-4 right-4 text-zinc-300 dark:text-zinc-600 group-hover:text-zinc-500 dark:group-hover:text-zinc-400 transition-colors" />
      )}
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

function Section({
  title,
  action,
  children,
}: {
  title: string;
  action?: { label: string; href: string };
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-sm">
      <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
        <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">{title}</h2>
        {action && (
          <Link href={action.href} className="text-xs text-primary hover:underline flex items-center gap-1">
            {action.label} <ArrowUpRight size={12} />
          </Link>
        )}
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function AdminDashboard({ data }: { data: AdminPayload }) {
  const { stats, postsByStatus, recentEnquiries, myActivity } = data;

  return (
    <div className="space-y-8">

      {/* ── Stat Cards ── */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
        <StatCard
          icon={BookOpen}
          label="Active Posts"
          value={fmt(stats.activePosts)}
          sub={`${postsByStatus["matched"] ?? 0} matched · ${postsByStatus["closed"] ?? 0} closed`}
          accent="bg-indigo-500"
          href="/admin/tuitions"
        />
        <StatCard
          icon={MessageSquare}
          label="Total Enquiries"
          value={fmt(stats.enquiries.total)}
          sub={`${stats.enquiries.new} new · ${stats.enquiries.inProgress} in progress`}
          accent="bg-amber-500"
          href="/admin/enquiries"
        />
        <StatCard
          icon={Activity}
          label="My Posts Created"
          value={fmt(myActivity.postsCreated)}
          sub={`${fmt(myActivity.enquiriesHandled)} enquiries handled`}
          accent="bg-purple-500"
        />
      </div>

      {/* ── Posts by Status + Recent Enquiries ── */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Section title="Posts by Status">
          <div className="space-y-3">
            {Object.entries(postsByStatus).length === 0 ? (
              <p className="text-sm text-zinc-400">No posts yet</p>
            ) : (
              Object.entries(postsByStatus).map(([status, count]) => {
                const total = Object.values(postsByStatus).reduce((a, b) => a + b, 0) || 1;
                const pct   = Math.round((count / total) * 100);
                return (
                  <div key={status}>
                    <div className="flex items-center justify-between mb-1">
                      <StatusBadge status={status} />
                      <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">{fmt(count)}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Section>

        <div className="lg:col-span-2">
          <Section title="Recent Enquiries" action={{ label: "View all", href: "/admin/enquiries" }}>
            <div className="space-y-3">
              {recentEnquiries.length === 0 ? (
                <p className="text-sm text-zinc-400">No enquiries yet</p>
              ) : (
                recentEnquiries.map((e) => (
                  <div key={e._id} className="flex items-start justify-between py-2 border-b border-zinc-50 dark:border-zinc-800 last:border-0 gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-zinc-800 dark:text-zinc-100 truncate">{e.name}</p>
                      <p className="text-[11px] text-zinc-400 truncate mt-0.5">{e.query}</p>
                      <p className="text-[10px] text-zinc-400 flex items-center gap-1 mt-0.5">
                        <Clock size={10} /> {relativeTime(e.createdAt)}
                      </p>
                    </div>
                    <StatusBadge status={e.currentStatus} />
                  </div>
                ))
              )}
            </div>
          </Section>
        </div>
      </div>

      {/* ── My Activity ── */}
      <Section title="My Activity">
        <div className="grid gap-4 sm:grid-cols-2">
          <Link href="/admin/tuitions" className="flex items-center gap-4 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors group">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center flex-shrink-0">
              <BookOpen size={18} className="text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{fmt(myActivity.postsCreated)}</p>
              <p className="text-xs text-zinc-500">Posts I created</p>
            </div>
            <ArrowUpRight size={14} className="ml-auto text-zinc-300 group-hover:text-zinc-500 transition-colors" />
          </Link>

          <Link href="/admin/enquiries" className="flex items-center gap-4 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors group">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center flex-shrink-0">
              <MessageSquare size={18} className="text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{fmt(myActivity.enquiriesHandled)}</p>
              <p className="text-xs text-zinc-500">Enquiries I handled</p>
            </div>
            <ArrowUpRight size={14} className="ml-auto text-zinc-300 group-hover:text-zinc-500 transition-colors" />
          </Link>
        </div>
      </Section>
    </div>
  );
}

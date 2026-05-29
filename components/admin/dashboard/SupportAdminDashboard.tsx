"use client";

import React from "react";
import Link from "next/link";
import {
  MessageSquare,
  Star,
  CheckCircle2,
  ArrowUpRight,
  Clock,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface SupportAdminPayload {
  role: "support_admin";
  stats: {
    myOpenEnquiries: number;
    handledToday: number;
    enquiryBreakdown: {
      new: number;
      inProgress: number;
      contacted: number;
      resolved: number;
    };
  };
  recentFeedbacks: Array<{
    _id: string;
    userSnapshot?: { name: string };
    category: string;
    subject: string;
    status: string;
    handledAt?: string;
    createdAt: string;
  }>;
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
  open:     "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",
  seen:     "bg-amber-100  text-amber-700  dark:bg-amber-900/40  dark:text-amber-300",
  resolved: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ${STATUS_COLORS[status] ?? "bg-zinc-100 text-zinc-600"}`}>
      {status}
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

// ─── Donut-style breakdown ───────────────────────────────────────────────────

function EnquiryBreakdown({
  breakdown,
}: {
  breakdown: SupportAdminPayload["stats"]["enquiryBreakdown"];
}) {
  const rows: Array<{ label: string; key: keyof typeof breakdown; color: string }> = [
    { label: "New",         key: "new",        color: "bg-indigo-500" },
    { label: "In Progress", key: "inProgress",  color: "bg-amber-500"  },
    { label: "Contacted",   key: "contacted",   color: "bg-cyan-500"   },
    { label: "Resolved",    key: "resolved",    color: "bg-emerald-500" },
  ];
  const total = Object.values(breakdown).reduce((a, b) => a + b, 0) || 1;

  return (
    <div className="space-y-3">
      {rows.map(({ label, key, color }) => {
        const count = breakdown[key];
        const pct   = Math.round((count / total) * 100);
        return (
          <div key={key}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${color}`} />
                <span className="text-xs text-zinc-600 dark:text-zinc-400">{label}</span>
              </div>
              <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
                {fmt(count)}
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800">
              <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function SupportAdminDashboard({
  data,
}: {
  data: SupportAdminPayload;
}) {
  const { stats, recentFeedbacks } = data;
  const totalBreakdown = Object.values(stats.enquiryBreakdown).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-8">

      {/* ── Stat Cards ── */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={MessageSquare}
          label="My Open Enquiries"
          value={fmt(stats.myOpenEnquiries)}
          sub="new, in-progress & contacted"
          accent="bg-amber-500"
          href="/admin/enquiries"
        />
        <StatCard
          icon={CheckCircle2}
          label="Handled Today"
          value={fmt(stats.handledToday)}
          sub="enquiries actioned since midnight"
          accent="bg-emerald-500"
        />
        <StatCard
          icon={Star}
          label="Total Enquiries"
          value={fmt(totalBreakdown)}
          sub="across all statuses"
          accent="bg-indigo-500"
          href="/admin/enquiries"
        />
      </div>

      {/* ── Breakdown + Recent Feedbacks ── */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Section title="My Enquiry Breakdown">
          <EnquiryBreakdown breakdown={stats.enquiryBreakdown} />
          <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <Link
              href="/admin/enquiries"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
            >
              Go to Enquiries <ArrowUpRight size={14} />
            </Link>
          </div>
        </Section>

        <Section
          title="Recent Feedbacks I Handled"
          action={{ label: "View all", href: "/admin/feedbacks" }}
        >
          <div className="space-y-3">
            {recentFeedbacks.length === 0 ? (
              <p className="text-sm text-zinc-400">No feedbacks handled yet</p>
            ) : (
              recentFeedbacks.map((f) => (
                <div
                  key={f._id}
                  className="flex items-start justify-between py-2 border-b border-zinc-50 dark:border-zinc-800 last:border-0 gap-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-zinc-800 dark:text-zinc-100 truncate">
                      {f.subject}
                    </p>
                    <p className="text-[11px] text-zinc-400 mt-0.5 capitalize">{f.category}</p>
                    <p className="text-[10px] text-zinc-400 flex items-center gap-1 mt-0.5">
                      <Clock size={10} /> {relativeTime(f.handledAt ?? f.createdAt)}
                    </p>
                  </div>
                  <StatusBadge status={f.status} />
                </div>
              ))
            )}
          </div>
        </Section>
      </div>

      {/* ── Quick Links ── */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/admin/enquiries"
          className="flex items-center gap-4 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-sm hover:shadow-md transition-shadow group"
        >
          <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center flex-shrink-0">
            <MessageSquare size={22} className="text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p className="font-semibold text-zinc-800 dark:text-zinc-100">Manage Enquiries</p>
            <p className="text-xs text-zinc-500 mt-0.5">View and respond to all enquiries</p>
          </div>
          <ArrowUpRight size={16} className="ml-auto text-zinc-300 group-hover:text-zinc-500 transition-colors" />
        </Link>

        <Link
          href="/admin/feedbacks"
          className="flex items-center gap-4 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-sm hover:shadow-md transition-shadow group"
        >
          <div className="w-12 h-12 rounded-xl bg-pink-100 dark:bg-pink-900/40 flex items-center justify-center flex-shrink-0">
            <Star size={22} className="text-pink-600 dark:text-pink-400" />
          </div>
          <div>
            <p className="font-semibold text-zinc-800 dark:text-zinc-100">Manage Feedbacks</p>
            <p className="text-xs text-zinc-500 mt-0.5">Review and handle user feedbacks</p>
          </div>
          <ArrowUpRight size={16} className="ml-auto text-zinc-300 group-hover:text-zinc-500 transition-colors" />
        </Link>
      </div>
    </div>
  );
}

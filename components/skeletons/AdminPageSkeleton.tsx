"use client";

import { Skeleton } from "@heroui/skeleton";

type AdminPageSkeletonProps = {
  rows?: number;
};

export function AdminPageSkeleton({ rows = 6 }: AdminPageSkeletonProps) {
  return (
    <div
      className="p-4 md:p-6 space-y-6 min-h-[50vh]"
      aria-busy="true"
      aria-label="Loading page"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Skeleton className="h-8 w-48 rounded-lg" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>
      </div>

      <Skeleton className="h-10 w-full max-w-lg rounded-xl" />

      <div className="flex gap-2 flex-wrap">
        <Skeleton className="h-8 w-20 rounded-full" />
        <Skeleton className="h-8 w-24 rounded-full" />
        <Skeleton className="h-8 w-16 rounded-full" />
      </div>

      <div className="grid gap-3">
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

export function AdminDashboardSkeleton() {
  return (
    <div
      className="p-4 md:p-6 space-y-8 min-h-[50vh]"
      aria-busy="true"
      aria-label="Loading dashboard"
    >
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-56 rounded-lg" />
          <Skeleton className="h-4 w-32 rounded-lg" />
        </div>
        <Skeleton className="h-7 w-28 rounded-full" />
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-default-200 p-5 space-y-3"
          >
            <Skeleton className="h-10 w-10 rounded-xl" />
            <Skeleton className="h-3 w-24 rounded-lg" />
            <Skeleton className="h-7 w-16 rounded-lg" />
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-56 w-full rounded-2xl" />
        <Skeleton className="h-56 w-full rounded-2xl" />
      </div>
    </div>
  );
}

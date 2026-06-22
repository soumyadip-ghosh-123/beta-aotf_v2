"use client";

import { Skeleton } from "@heroui/skeleton";

export function DetailSkeleton() {
  return (
    <div className="space-y-6 pb-16" aria-busy="true" aria-label="Loading details">
      <Skeleton className="h-9 w-24 rounded-lg" />

      <div className="rounded-2xl border border-default-200 p-6 space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-7 w-2/3 rounded-lg" />
            <Skeleton className="h-4 w-1/3 rounded-lg" />
          </div>
          <Skeleton className="h-8 w-20 rounded-full shrink-0" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-8 w-8 rounded-lg" />
              <Skeleton className="h-3 w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4 rounded-lg" />
            </div>
          ))}
        </div>

        <Skeleton className="h-px w-full" />

        <div className="space-y-2">
          <Skeleton className="h-4 w-full rounded-lg" />
          <Skeleton className="h-4 w-full rounded-lg" />
          <Skeleton className="h-4 w-4/5 rounded-lg" />
        </div>

        <div className="flex gap-3 pt-2">
          <Skeleton className="h-11 flex-1 rounded-xl" />
          <Skeleton className="h-11 w-11 rounded-xl shrink-0" />
        </div>
      </div>
    </div>
  );
}

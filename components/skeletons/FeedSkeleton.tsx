"use client";

import { Skeleton } from "@heroui/skeleton";

function FeedCardSkeleton() {
  return (
    <div className="w-full rounded-2xl border border-default-200 p-4 space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-1/3 rounded-lg" />
          <Skeleton className="h-3 w-1/2 rounded-lg" />
        </div>
      </div>
      <Skeleton className="h-4 w-full rounded-lg" />
      <Skeleton className="h-4 w-4/5 rounded-lg" />
      <div className="flex gap-2">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-24 rounded-full" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <div className="flex justify-between pt-1">
        <Skeleton className="h-9 w-28 rounded-xl" />
        <Skeleton className="h-9 w-28 rounded-xl" />
      </div>
    </div>
  );
}

type FeedSkeletonProps = {
  count?: number;
};

export function FeedSkeleton({ count = 5 }: FeedSkeletonProps) {
  return (
    <div
      className="flex flex-col items-center justify-center w-full px-2 mb-16"
      aria-busy="true"
      aria-label="Loading feed"
    >
      <div className="w-full max-w-3xl mb-6 flex gap-2">
        <Skeleton className="h-12 flex-1 rounded-xl" />
        <Skeleton className="h-12 w-12 rounded-xl shrink-0" />
        <Skeleton className="h-12 w-24 rounded-xl shrink-0" />
      </div>
      <div className="w-full max-w-3xl flex flex-col gap-4">
        {Array.from({ length: count }).map((_, i) => (
          <FeedCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

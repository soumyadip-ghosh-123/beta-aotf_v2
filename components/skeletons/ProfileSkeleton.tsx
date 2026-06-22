"use client";

import { Skeleton } from "@heroui/skeleton";

export function ProfileSkeleton() {
  return (
    <div className="space-y-6 pb-16" aria-busy="true" aria-label="Loading profile">
      <Skeleton className="h-9 w-24 rounded-lg" />

      <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
        <Skeleton className="h-32 w-32 rounded-full shrink-0" />
        <div className="flex-1 w-full space-y-3 text-center md:text-left">
          <Skeleton className="h-8 w-48 rounded-lg mx-auto md:mx-0" />
          <Skeleton className="h-4 w-full max-w-md rounded-lg mx-auto md:mx-0" />
          <Skeleton className="h-4 w-3/4 max-w-sm rounded-lg mx-auto md:mx-0" />
          <div className="flex gap-2 justify-center md:justify-start">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        </div>
      </div>

      <Skeleton className="h-10 w-full rounded-xl" />

      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    </div>
  );
}

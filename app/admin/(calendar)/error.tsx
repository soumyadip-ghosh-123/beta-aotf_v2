"use client";

import { Button } from "@heroui/button";
import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function CalendarError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <h2 className="text-lg font-bold">Calendar failed to load</h2>
      <Button onClick={() => reset()}>Try again</Button>
    </div>
  );
}

"use client";

import * as Sentry from "@sentry/nextjs";

import { shouldReportToSentry } from "@/lib/sentry-report";

export interface ClientReportContext {
  feature?: string;
  extra?: Record<string, unknown>;
}

/**
 * Report unexpected client-side errors to Sentry.
 * Skips operational errors, user cancellation, and HTTP 4xx responses.
 */
export function reportClientError(
  error: unknown,
  context?: ClientReportContext,
): void {
  if (!shouldReportToSentry(error)) return;

  if (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    typeof (error as { status: number }).status === "number" &&
    (error as { status: number }).status >= 400 &&
    (error as { status: number }).status < 500
  ) {
    return;
  }

  Sentry.captureException(error, {
    tags: context?.feature ? { feature: context.feature } : undefined,
    extra: context?.extra,
  });
}

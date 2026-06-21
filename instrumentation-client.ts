// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

import {
  sentryDsn,
  sentryReplaysSessionSampleRate,
  sentrySendDefaultPii,
  sentryTracesSampleRate,
} from "./lib/sentry-config";

Sentry.init({
  dsn: sentryDsn,

  integrations: [Sentry.replayIntegration()],

  tracesSampleRate: sentryTracesSampleRate,

  enableLogs: true,

  replaysSessionSampleRate: sentryReplaysSessionSampleRate,

  replaysOnErrorSampleRate: 1.0,

  sendDefaultPii: sentrySendDefaultPii,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;

const isProd = process.env.NODE_ENV === "production";

export const sentryDsn =
  process.env.NEXT_PUBLIC_SENTRY_DSN ??
  "https://274fb4d9a4a51ddb6cc85d7b35069c05@o4511274687135744.ingest.us.sentry.io/4511274688446464";

export const sentryTracesSampleRate = isProd ? 0.1 : 1;

export const sentryReplaysSessionSampleRate = isProd ? 0.1 : 1;

export const sentrySendDefaultPii = !isProd;

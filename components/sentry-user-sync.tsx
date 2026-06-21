"use client";

import * as Sentry from "@sentry/nextjs";
import { useUser } from "@clerk/nextjs";
import { useEffect } from "react";

export function SentryUserSync() {
  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (!isLoaded) return;

    if (user) {
      Sentry.setUser({ id: user.id });
    } else {
      Sentry.setUser(null);
    }
  }, [isLoaded, user]);

  return null;
}

"use client";

import { useEffect, useRef } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";

type InlineAd = {
  adId: string;
  title: string;
  adType: "image" | "text" | "html";
  placement: string;
  imageUrl?: string;
  content?: string;
  targetUrl?: string;
  advertiser: string;
};

export default function InlineAdCard({ ad }: { ad: InlineAd }) {
  const impressionTracked = useRef(false);

  useEffect(() => {
    if (impressionTracked.current) {
      return;
    }

    impressionTracked.current = true;
    void fetch(`/api/v1/ads/${ad.adId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ _action: "impression" }),
    });
  }, [ad.adId]);

  const trackClick = () => {
    return fetch(`/api/v1/ads/${ad.adId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ _action: "click" }),
      keepalive: true,
    });
  };

  const handleOpen = () => {
    if (!ad.targetUrl) {
      return;
    }

    void trackClick();
    window.open(ad.targetUrl, "_blank", "noopener,noreferrer");
  };

  const placementLabel = ad.placement.replace(/_/g, " ");
  const hasTarget = Boolean(ad.targetUrl);

  return (
    <Card
      className={`w-full overflow-hidden border border-amber-200/70 bg-linear-to-br from-amber-50 via-white to-orange-50 shadow-sm transition-transform dark:border-amber-900/40 dark:from-amber-950/40 dark:via-zinc-950 dark:to-orange-950/30 ${
        hasTarget ? "cursor-pointer hover:-translate-y-0.5 hover:shadow-md" : ""
      }`}
      role={hasTarget ? "link" : undefined}
      tabIndex={hasTarget ? 0 : undefined}
      onClick={handleOpen}
      onKeyDown={(event) => {
        if (!hasTarget) {
          return;
        }

        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleOpen();
        }
      }}
    >
      <CardHeader className="flex flex-col items-start gap-2 px-4 pb-0 pt-4">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-default-400">
            Sponsored by
          </p>
          <Chip radius="sm" size="sm" className="bg-amber-500 text-white">
            {ad.advertiser}
          </Chip>
        </div>

        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          {ad.title}
        </h3>
      </CardHeader>
      <CardBody className="gap-3 px-4 pb-4 pt-3">
        {ad.imageUrl ? (
          <img
            src={ad.imageUrl}
            alt={ad.title}
            className="h-40 w-full rounded-xl object-cover"
          />
        ) : null}
        {ad.content ? (
          <p className="text-sm leading-6 text-default-600">{ad.content}</p>
        ) : null}
      </CardBody>
    </Card>
  );
}

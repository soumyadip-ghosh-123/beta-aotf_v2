"use client";

import { RefreshCw } from "lucide-react";
import { Button } from "@heroui/button";
import { useCalendar } from "@/calendar/contexts/calendar-context";
import { addToast } from "@heroui/toast";

export function RefreshButton() {
  const { refreshEvents, isRefreshing } = useCalendar();

  const handleRefresh = async () => {
    await refreshEvents();
    addToast({ description: "Calendar updated", color: "success" });
  };

  return (
    <Button
      isIconOnly
      variant="flat"
      size="md"
      isLoading={isRefreshing}
      onPress={() => void handleRefresh()}
      aria-label="Refresh calendar"
      title="Refresh calendar"
    >
      {!isRefreshing && <RefreshCw strokeWidth={1.8} className="size-4" />}
    </Button>
  );
}

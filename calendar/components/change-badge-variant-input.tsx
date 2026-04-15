"use client";

import { useCalendar } from "@/calendar/contexts/calendar-context";
import type { TBadgeVariant } from "@/calendar/types"; // 👈 adjust path if needed

import { Select, SelectItem } from "@heroui/select";

export function ChangeBadgeVariantInput() {
  const { badgeVariant, setBadgeVariant } = useCalendar();

  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold">Change badge variant</p>

      <Select
        className="w-48"
        selectedKeys={badgeVariant ? [badgeVariant] : []}
        onSelectionChange={(keys) => {
          const value = Array.from(keys)[0] as TBadgeVariant;
          setBadgeVariant(value);
        }}
      >
        {[
          { key: "dot", label: "Dot" },
          { key: "colored", label: "Colored" },
          { key: "mixed", label: "Mixed" },
        ].map((item) => (
          <SelectItem key={item.key} textValue={item.label}>
            {item.label}
          </SelectItem>
        ))}
      </Select>
    </div>
  );
}
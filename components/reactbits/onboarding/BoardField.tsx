"use client";

import { useId } from "react";
import { Select, SelectItem } from "@heroui/select";
import { BOARD_OPTIONS } from "./types";
import type { SharedSelection } from "@heroui/system";

interface BoardFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export default function BoardField({ value, onChange }: BoardFieldProps) {
  const id = useId();
  return (
    <Select
      id={`board-select-${id}`}
      label="School Board"
      isRequired
      selectedKeys={value ? new Set([value]) : new Set<string>()}
      onSelectionChange={(keys: SharedSelection) => {
        const selected = Array.from(keys)[0] as string | undefined;
        onChange(selected ?? "");
      }}
    >
      {BOARD_OPTIONS.map((b) => (
        <SelectItem key={b.key} textValue={b.label}>
          {b.label}
        </SelectItem>
      ))}
    </Select>
  );
}

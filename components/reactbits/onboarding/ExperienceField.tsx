"use client";

import { useId } from "react";
import { Select, SelectItem } from "@heroui/select";
import { EXPERIENCE_OPTIONS } from "./types";
import type { SharedSelection } from "@heroui/system";

interface ExperienceFieldProps {
  label: string;
  value: string;
  isRequired?: boolean;
  onChange: (value: string) => void;
}

export default function ExperienceField({
  label,
  value,
  isRequired = false,
  onChange,
}: ExperienceFieldProps) {
  const id = useId();
  return (
    <Select
      id={`experience-select-${id}`}
      label={label}
      isRequired={isRequired}
      selectedKeys={value ? new Set([value]) : new Set<string>()}
      onSelectionChange={(keys: SharedSelection) => {
        const selected = Array.from(keys)[0] as string | undefined;
        onChange(selected ?? "");
      }}
    >
      {EXPERIENCE_OPTIONS.map((v) => (
        <SelectItem key={v} textValue={`${v} years`}>
          {v} years
        </SelectItem>
      ))}
    </Select>
  );
}

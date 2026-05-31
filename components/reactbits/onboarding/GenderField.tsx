"use client";

import { Select, SelectItem } from "@heroui/select";
import { useState } from "react";
import { validateField } from "./types";

interface GenderFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export const GENDER_OPTIONS = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
  { value: "Other", label: "Other" },
];

export default function GenderField({ value, onChange }: GenderFieldProps) {
  const [touched, setTouched] = useState(false);
  const error = touched ? validateField("gender", value) : null;

  return (
    <Select
      label="Gender"
      placeholder="Select Gender"
      isRequired
      selectedKeys={value ? [value] : []}
      isInvalid={!!error}
      errorMessage={error}
      onSelectionChange={(keys) => {
        const selected = Array.from(keys)[0] as string;
        onChange(selected || "");
      }}
      onClose={() => setTouched(true)}
    >
      {GENDER_OPTIONS.map((opt) => (
        <SelectItem key={opt.value}>
          {opt.label}
        </SelectItem>
      ))}
    </Select>
  );
}

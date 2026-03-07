"use client";

import { Textarea } from "@heroui/input";
import { useState } from "react";
import { validateField } from "./types";

interface AddressFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export default function AddressField({ value, onChange }: AddressFieldProps) {
  const [touched, setTouched] = useState(false);
  const error = touched ? validateField("address", value) : null;

  return (
    <Textarea
      label="Your Address"
      isRequired
      maxLength={200}
      value={value}
      isInvalid={!!error}
      errorMessage={error}
      onValueChange={onChange}
      onBlur={() => setTouched(true)}
    />
  );
}

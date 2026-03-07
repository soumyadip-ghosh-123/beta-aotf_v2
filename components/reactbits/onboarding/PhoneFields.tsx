"use client";

import { Input } from "@heroui/input";
import { Checkbox } from "@heroui/checkbox";
import { useState } from "react";
import { validateField } from "./types";

interface PhoneFieldsProps {
  phone: string;
  whatsapp: string;
  sameAsPhone: boolean;
  onChange: (
    key: "phone" | "whatsapp" | "sameAsPhone",
    value: string | boolean
  ) => void;
}

export default function PhoneFields({
  phone,
  whatsapp,
  sameAsPhone,
  onChange,
}: PhoneFieldsProps) {
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [whatsappTouched, setWhatsappTouched] = useState(false);

  const phoneError = phoneTouched ? validateField("phone", phone) : null;
  const whatsappError = whatsappTouched
    ? validateField("whatsapp", whatsapp)
    : null;

  return (
    <>
      <Input
        label="Phone Number"
        type="tel"
        isRequired
        maxLength={10}
        value={phone}
        isInvalid={!!phoneError}
        errorMessage={phoneError}
        onValueChange={(v) => onChange("phone", v)}
        onBlur={() => setPhoneTouched(true)}
      />

      <div className="flex flex-col gap-2">
        <Input
          label="WhatsApp Number"
          type="tel"
          isRequired
          maxLength={10}
          isDisabled={sameAsPhone}
          value={whatsapp}
          isInvalid={!!whatsappError}
          errorMessage={whatsappError}
          onValueChange={(v) => onChange("whatsapp", v)}
          onBlur={() => setWhatsappTouched(true)}
        />

        <Checkbox
          isSelected={sameAsPhone}
          onValueChange={(v) => onChange("sameAsPhone", v)}
        >
          Same as phone number
        </Checkbox>
      </div>
    </>
  );
}

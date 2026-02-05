"use client";

import React, { useState } from "react";
import { Tabs, Tab } from "@heroui/tabs";
import { Input, Textarea } from "@heroui/input";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { addToast } from "@heroui/toast";
import { z } from "zod";
import { SendIcon } from "lucide-react";

const schema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be at most 50 characters")
    .regex(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces"),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian phone number"),
  query: z.string().min(1, "Please enter your query"),
});

export default function EnquiryForm() {
  const [role, setRole] = useState<"guardian" | "client">("guardian");
  const [form, setForm] = useState({ name: "", phone: "", query: "" });
  const [errors, setErrors] = useState<
    Partial<Record<keyof typeof form, string>>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const placeHolderText =
    role === "guardian"
      ? "I need a science tutor for my son in class 6, ICSE"
      : "I need a specific talent for my company/project.";

  const showToast = (message: string, kind: "success" | "error") => {
    addToast({
      description: message,
      color: kind === "success" ? "success" : "danger",
    });
  };

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((s) => ({ ...s, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const result = schema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof typeof form, string>> = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof typeof form;
        fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      const first = result.error.issues[0];
      showToast(first?.message || "Validation error", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          phoneNumber: form.phone.trim(),
          query: form.query.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      showToast(
        `Enquiry submitted successfully! Your ID: ${data.enquiryId}`,
        "success"
      );
      setForm({ name: "", phone: "", query: "" });
      setErrors({});
    } catch (err: any) {
      showToast(err.message || "Failed to submit enquiry", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="max-w-md w-full mx-auto">
      <CardHeader className="flex flex-col gap-1 ">
        <h3 className="text-lg font-semibold">Let us connect</h3>
        <p className="text-sm text-default-500">Are you a guardian or client? Select and fill the enquiry form.</p>
      </CardHeader>
      <CardBody>
        <Tabs
          selectedKey={role}
          onSelectionChange={(k) => setRole(k as any)}
          aria-label="Enquiry role tabs"
          className="mb-4 w-full justify-center grid grid-cols-1"
        >
          <Tab key="guardian" title="Guardian" />
          <Tab key="client" title="Client" />
        </Tabs>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <Input
            label="Name"
            placeholder="Your full name"
            value={form.name}
            onValueChange={(v) => handleChange("name", v)}
            isRequired
            isInvalid={!!errors.name}
            errorMessage={errors.name}
            variant="bordered"
          />

          <Input
            label="Phone Number"
            placeholder="Your phone number"
            value={form.phone}
            onValueChange={(v) => handleChange("phone", v)}
            isRequired
            isInvalid={!!errors.phone}
            errorMessage={errors.phone}
            variant="bordered"
            type="tel"
          />

          <Textarea
            label="Query"
            placeholder={placeHolderText}
            value={form.query}
            onChange={(e) => handleChange("query", e.target.value)}
            isRequired
            isInvalid={!!errors.query}
            errorMessage={errors.query}
            minRows={4}
            variant="bordered"
          />

          <div className="flex gap-2 mt-2">
            <Button
              type="button"
              variant="bordered"
              onClick={() => setForm({ name: "", phone: "", query: "" })}
            >
              Reset
            </Button>
            <Button
              type="submit"
              color="primary"
              className="flex-1"
              isLoading={isSubmitting}
            >
              Submit Enquiry <SendIcon className="ml-1" size={16} />
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}

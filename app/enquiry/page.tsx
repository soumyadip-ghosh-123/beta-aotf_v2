"use client";

import { useState } from "react";
import { title } from "@/components/primitives";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Input, Textarea } from "@heroui/input";
import { Button } from "@heroui/button";
import { Tabs, Tab } from "@heroui/tabs";
import { addToast } from "@heroui/toast";

export default function EnquiryPage() {
  const [selected, setSelected] = useState("guardian");
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    query: "",
  });
  const [errors, setErrors] = useState({
    name: false,
    phone: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const showToast = (message: string, type: "success" | "error") => {
    addToast({
      description: message,
      color: type === "success" ? "success" : "danger",
    });
  };

  const validateName = (name: string): boolean => {
    const nameRegex = /^[a-zA-Z\s]{2,50}$/;
    return nameRegex.test(name.trim());
  };
  const validatePhone = (phone: string): boolean => {
    // Only accepts 10 digit numbers starting with 6-9
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone.trim());
  };

  const handleNameChange = (value: string) => {
    setFormData({ ...formData, name: value });
    if (errors.name && validateName(value)) {
      setErrors({ ...errors, name: false });
    }
  };

  const handlePhoneChange = (value: string) => {
    setFormData({ ...formData, phone: value });
    if (errors.phone && validatePhone(value)) {
      setErrors({ ...errors, phone: false });
    }
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate name
    if (!validateName(formData.name)) {
      setErrors((prev) => ({ ...prev, name: true }));
      showToast(
        "Invalid name! Please enter a valid name (2-50 characters, letters only).",
        "error"
      );
      return;
    }

    // Validate phone
    if (!validatePhone(formData.phone)) {
      setErrors((prev) => ({ ...prev, phone: true }));
      showToast(
        "Invalid phone number! Please enter a valid Indian phone number.",
        "error"
      );
      return;
    }

    // Validate query
    if (!formData.query.trim()) {
      showToast("Please enter your query.", "error");
      return;
    }

    setIsSubmitting(true);

    // Simulate form submission - storing data based on user type
    setTimeout(() => {
      const submissionData = {
        userType: selected, // "guardian" or "client"
        ...formData,
        timestamp: new Date().toISOString(),
      };

      // Here you would send submissionData to your backend
      console.log(`Submitting ${selected} enquiry:`, submissionData);

      showToast(
        `Enquiry submitted successfully as ${selected}! We'll get back to you soon.`,
        "success"
      );
      setFormData({ name: "", phone: "", query: "" });
      setErrors({ name: false, phone: false });
      setIsSubmitting(false);
    }, 1000);
  };
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
      <div className="w-full max-w-2xl">
        <Card className="w-full mt-4">
          <CardHeader className="flex flex-col gap-1 pb-4">
            <h2 className="text-2xl font-bold">Enquiry Form</h2>
            <p className="text-sm text-default-500">
              Are you a Guardian looking for tutors or a Client wanting to post
              a job?
            </p>
          </CardHeader>
          <CardBody>
            <div className="mb-4">
              <p className="text-sm text-default-600">
                Looking for a tutor for your child? Fill out the form below.
              </p>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Input
                label="Name"
                placeholder="Enter your full name"
                value={formData.name}
                onValueChange={handleNameChange}
                isRequired
                isClearable
                variant="bordered"
                isInvalid={errors.name}
                errorMessage={
                  errors.name
                    ? "Please enter a valid name (2-50 characters, letters only)"
                    : ""
                }
                classNames={{
                  input: "text-base",
                  inputWrapper: errors.name ? "border-danger" : "",
                }}
              />

              <Input
                label="Phone Number"
                placeholder="Enter your phone number"
                type="tel"
                value={formData.phone}
                onValueChange={handlePhoneChange}
                isRequired
                isClearable
                variant="bordered"
                isInvalid={errors.phone}
                errorMessage={
                  errors.phone ? "Please enter a valid Indian phone number" : ""
                }
                classNames={{
                  input: "text-base",
                  inputWrapper: errors.phone ? "border-danger" : "",
                }}
              />
              <Textarea
                isClearable
                label="Query"
                variant="bordered"
                placeholder="Write your enquiry here..."
                value={formData.query}
                onChange={(e) =>
                  setFormData({ ...formData, query: e.target.value })
                }
                required
                rows={4}
                classNames={{
                  input: "resize-y min-h-[40px]",
                }}
              />

              <Button
                type="submit"
                color="primary"
                size="lg"
                isLoading={isSubmitting}
                className="w-full mt-2 bg-linear-to-r from-indigo-600 to-[#8A7DFF] active:scale-95"
              >
                Submit Your Enquiry
              </Button>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

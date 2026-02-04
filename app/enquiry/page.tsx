"use client";

import { useState } from "react";
import { title } from "@/components/primitives";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Input, Textarea } from "@heroui/input";
import { Button } from "@heroui/button";
import { Tabs, Tab } from "@heroui/tabs";
import { addToast } from "@heroui/toast";
import EnquiryForm from "@/components/enquiry/EnquiryForm";
import { TestTube } from "lucide-react";

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
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] w-full">
      <EnquiryForm />
    </div>
  );
}

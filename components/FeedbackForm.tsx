"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardBody } from "@heroui/card";
import { Input, Textarea } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Button } from "@heroui/button";
import { addToast } from "@heroui/toast";
import { SendIcon, Star, CircleCheckBig } from "lucide-react";

type Category = "bug" | "suggestion" | "complaint" | "payment" | "general";

export default function FeedbackForm() {
  const [category, setCategory] = useState<Category | "">("");
  const [subject, setSubject] = useState("");
  const [rating, setRating] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const reset = () => {
    setCategory("");
    setSubject("");
    setRating(null);
    setMessage("");
  };

  const validate = () => {
    if (!category) {
      addToast({ description: "Please choose a category.", color: "danger" });
      return false;
    }
    if (!subject.trim()) {
      addToast({ description: "Please enter a subject.", color: "danger" });
      return false;
    }
    if (message.trim().length < 10) {
      addToast({
        description: "Please enter at least 10 characters in your feedback.",
        color: "danger",
      });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);

    try {
      const res = await fetch("/api/v1/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          category,
          subject: subject.trim(),
          message: message.trim(),
          rating: rating ?? undefined,
        }),
      });

      const contentType = res.headers.get("content-type") ?? "";
      const isJson = contentType.includes("application/json");
      const data = isJson ? await res.json() : null;

      if (!res.ok) {
        const fieldErrorMessage = data?.fieldErrors
          ? Object.values(data.fieldErrors)
              .flat()
              .join(" ")
          : null;

        throw new Error(
          fieldErrorMessage ||
            data?.error ||
            `Failed to submit feedback (${res.status})`,
        );
      }

      addToast({ description: "Feedback submitted.", color: "success" });
      setSubmitted(true);
      reset();
      setTimeout(() => setSubmitted(false), 2000);
    } catch (error) {
      addToast({
        description:
          error instanceof Error
            ? error.message
            : "Failed to submit feedback",
        color: "danger",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-lg mx-auto ">
      <CardHeader className="flex flex-col gap-1">
        <h3 className="text-lg font-semibold">Submit Feedback</h3>
        <p className="text-sm text-default-500">Tell us what's on your mind</p>
      </CardHeader>
      <CardBody>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-sm block mb-1">Category *</label>
            <Select
              selectedKeys={category ? [category] : []}
              onChange={(e: any) => setCategory(e.target.value as Category)}
              placeholder="Select category"
              name="category"
              className="w-full"
            >
              <SelectItem key="bug">Bug</SelectItem>
              <SelectItem key="suggestion">Suggestion</SelectItem>
              <SelectItem key="complaint">Complaint</SelectItem>
              <SelectItem key="payment">Payment</SelectItem>
              <SelectItem key="general">General</SelectItem>
            </Select>
          </div>

          <Input
            label="Subject"
            placeholder="Short subject"
            value={subject}
            onValueChange={setSubject}
            isRequired
            variant="bordered"
          />
          <div>
            <label className="text-sm block mb-2">Rating</label>

            <div className="grid grid-cols-5 gap-1 justify-items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <Button
                  key={star}
                  isIconOnly
                  variant="light"
                  aria-label={`Rate ${star}`}
                  onPress={() => setRating(star)}
                  className="p-1"
                >
                  <Star
                    size={30}
                    className={`transition-colors ${
                      (rating ?? 0) >= star
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-400"
                    }`}
                  />
                </Button>
              ))}
            </div>
          </div>

          <Textarea
            label="Give your feedback here"
            placeholder={
              "Describe your issue, suggestion, or any other feedback you have."
            }
            value={message}
            onValueChange={setMessage}
            variant="bordered"
            minRows={4}
            classNames={{ input: "text-base" }}
            isRequired
          />

          <div className="flex gap-3">
            <Button type="button" variant="bordered" onPress={reset} isDisabled={submitting}>
              Reset
            </Button>
            <Button
              type="submit"
              color="primary"
              className="w-full"
              isDisabled={submitting}
              isLoading={submitting}
            >
              {submitted ? (
                <>
                  Submitted <CircleCheckBig className="ml-1" size={16} />
                </>
              ) : (
                <>
                  Submit Feedback <SendIcon className="ml-1" size={16} />
                </>
              )}
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}

"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardBody } from "@heroui/card";
import { Input, Textarea } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Button } from "@heroui/button";
import { addToast } from "@heroui/toast";
import { SendIcon, Star, CheckIcon, CircleCheckBig } from "lucide-react";

type Category = "bug" | "suggestion" | "complaint" | "payment" | "general";
type Status = "open" | "pending" | "resolved";

export default function FeedbackForm() {
  const [category, setCategory] = useState<Category | "">("");
  const [subject, setSubject] = useState("");
  const [rating, setRating] = useState<number | null>(null);
  const [status, setStatus] = useState<Status | "">("");
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const reset = () => {
    setCategory("");
    setSubject("");
    setRating(null);
    setStatus("");
    setQuery("");
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
    if (rating === null || rating === undefined) {
      addToast({ description: "Please provide a rating.", color: "danger" });
      return false;
    }
    if (!status) {
      addToast({ description: "Please select a status.", color: "danger" });
      return false;
    }
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      category,
      subject: subject.trim(),
      rating: Number(rating),
      status,
      query: query.trim(),
      createdAt: new Date().toISOString(),
    };

    console.log("Feedback payload:", payload);

    addToast({ description: "Feedback submitted.", color: "success" });

    setSubmitted(true);
    reset();

    // optional: reset button after 2 seconds
    setTimeout(() => setSubmitted(false), 2000);
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
              selectedKeys={[category]}
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
            <label className="text-sm block mb-2">Rating *</label>

            <div className="grid grid-cols-5 gap-1">
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
                    size={24}
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
            value={query}
            onChange={(e: any) => setQuery(e.target.value)}
            variant="bordered"
            minRows={4}
            classNames={{ input: "text-base" }}
          />

          <div className="flex gap-3">
            <Button type="button" variant="bordered" onClick={reset}>
              Reset
            </Button>
            <Button
              type="submit"
              color="primary"
              className="w-full"
              isDisabled={submitted}
              onPress={() => {
                setSubmitted(true);
              }}
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

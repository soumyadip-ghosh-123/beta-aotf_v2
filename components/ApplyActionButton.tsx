"use client";

import { Button } from "@heroui/button";
import { addToast } from "@heroui/toast";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { FaArrowRight } from "react-icons/fa";
import { MdDoneAll } from "react-icons/md";

type ApplyTarget = "post" | "job";

interface ApplyActionButtonProps {
  target: ApplyTarget;
  targetId: string;
  initialApplied?: boolean;
  isSignedIn?: boolean;
  isEligible?: boolean;
  ineligibleLabel?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  color?: "default" | "primary" | "secondary" | "success" | "warning" | "danger";
}

function getEndpoint(target: ApplyTarget, targetId: string): string {
  return target === "post"
    ? `/api/v1/posts/${targetId}/applications`
    : `/api/v1/jobs/${targetId}/applications`;
}

export default function ApplyActionButton({
  target,
  targetId,
  initialApplied = false,
  isSignedIn = false,
  isEligible,
  ineligibleLabel = "Not eligible",
  className,
  size = "sm",
  color = "primary",
}: ApplyActionButtonProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isApplied, setIsApplied] = useState(initialApplied);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resourceLabel = target === "post" ? "tuition post" : "job";
  const isDisabled = isApplied || isSubmitting || (isSignedIn && isEligible === false);

  const handleApply = async () => {
    if (isApplied || isSubmitting) {
      return;
    }

    if (!isSignedIn) {
      const redirectTo = pathname || (target === "post" ? `/posts/${targetId}` : `/jobs/${targetId}`);
      router.push(`/sign-in?redirect_url=${encodeURIComponent(redirectTo)}`);
      return;
    }

    if (isEligible === false) {
      addToast({ description: ineligibleLabel, color: "warning" });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(getEndpoint(target, targetId), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (response.status === 403 && data.redirectTo === "/onboarding") {
          router.push("/onboarding");
          return;
        }

        if (
          response.status === 400 &&
          typeof data.error === "string" &&
          (data.error.includes("phone number") ||
            data.error.includes("Complete your profile"))
        ) {
          router.push("/onboarding");
          return;
        }

        if (response.status === 409) {
          setIsApplied(true);
          addToast({
            description: data.error || `You have already applied to this ${resourceLabel}.`,
            color: "warning",
          });
          return;
        }

        throw new Error(data.error || `Failed to apply to this ${resourceLabel}.`);
      }

      setIsApplied(true);
      addToast({
        description: data.message || `Application submitted for this ${resourceLabel}.`,
        color: "success",
      });
      router.refresh();
    } catch (error) {
      addToast({
        description:
          error instanceof Error
            ? error.message
            : `Failed to apply to this ${resourceLabel}.`,
        color: "danger",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const label = !isSignedIn
    ? "Sign In to Apply"
    : isApplied
      ? "Applied"
      : isEligible === false
        ? ineligibleLabel
        : "Apply";

  return (
    <Button
      size={size}
      color={isApplied ? "default" : color}
      className={className}
      isDisabled={isDisabled}
      isLoading={isSubmitting}
      onPress={handleApply}
    >
      {label}
      {isApplied ? <MdDoneAll /> : <FaArrowRight />}
    </Button>
  );
}
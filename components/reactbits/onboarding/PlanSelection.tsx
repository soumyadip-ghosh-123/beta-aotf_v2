"use client";

import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { PLANS, type PlanValue } from "./types";

interface PlanSelectionProps {
  selectedPlan: PlanValue | "";
  onPlanChange: (plan: PlanValue) => void;
  isSaving: boolean;
  isSavingOnboarding: boolean;
  saveError: string | null;
  onRetryProfile: () => void;
  onboardingDetailsError: string | null;
  onRetryOnboarding: () => void;
}

export default function PlanSelection({
  selectedPlan,
  onPlanChange,
  isSaving,
  isSavingOnboarding,
  saveError,
  onRetryProfile,
  onboardingDetailsError,
  onRetryOnboarding,
}: PlanSelectionProps) {
  return (
    <div className="space-y-4">
      {/* Save status banners */}
      {(isSaving || isSavingOnboarding) && (
        <p className="text-sm text-default-500 text-center">
          Saving your details…
        </p>
      )}
      {saveError && (
        <div className="p-3 rounded-lg bg-danger-50 border border-danger-200 text-danger text-sm flex items-center justify-between gap-3">
          <span>{saveError}</span>
          <Button
            size="sm"
            color="danger"
            variant="flat"
            onPress={onRetryProfile}
            isLoading={isSaving}
          >
            Retry
          </Button>
        </div>
      )}
      {onboardingDetailsError && (
        <div className="p-3 rounded-lg bg-danger-50 border border-danger-200 text-danger text-sm flex items-center justify-between gap-3">
          <span>{onboardingDetailsError}</span>
          <Button
            size="sm"
            color="danger"
            variant="flat"
            onPress={onRetryOnboarding}
            isLoading={isSavingOnboarding}
          >
            Retry
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {PLANS.map((plan) => (
          <Card
            key={plan.value}
            isPressable
            isHoverable
            className={`border-2 transition-colors ${
              selectedPlan === plan.value
                ? "border-primary"
                : "border-default-200"
            }`}
            onPress={() => onPlanChange(plan.value)}
          >
            <CardHeader className="font-bold text-lg pb-1">
              {plan.label} — {plan.display} / month
            </CardHeader>
            <CardBody className="pt-0 text-sm text-default-500">
              {plan.description}
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}

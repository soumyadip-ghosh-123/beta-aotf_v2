"use client";

import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { PLANS, type PlanValue } from "./types";

interface PaymentStepProps {
  plan: PlanValue | "";
  isPaymentLoading: boolean;
  paymentError: string | null;
  onPay: () => void;
  /** True while profile/onboarding details are still saving */
  isSavingDetails?: boolean;
  /** True for users migrated from the legacy system who already paid */
  isLegacyMigrated?: boolean;
}

export default function PaymentStep({
  plan,
  isPaymentLoading,
  paymentError,
  onPay,
  isSavingDetails = false,
  isLegacyMigrated = false,
}: PaymentStepProps) {
  const selectedPlan = PLANS.find((p) => p.value === plan);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-center">
        {isLegacyMigrated ? "Activate Your Account" : "Complete Payment"}
      </h2>

      {/* ── Legacy-migration banner ──────────────────────────────────── */}
      {isLegacyMigrated && (
        <Card className="border border-success-200 bg-success-50">
          <CardBody className="space-y-1 text-sm">
            <p className="font-semibold text-success-700">
              🎉 Welcome back! Your previous payment is on record.
            </p>
            <p className="text-success-600">
              You&apos;ve already paid for AOTF on our previous platform. No
              payment is required — just click <strong>Activate Account</strong>{" "}
              to complete your setup.
            </p>
          </CardBody>
        </Card>
      )}

      {/* ── Normal plan summary (only for non-migrated users) ─────────── */}
      {!isLegacyMigrated && selectedPlan && (
        <Card>
          <CardBody className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-default-500">Plan</span>
              <span className="font-medium">{selectedPlan.label}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-default-500">Amount</span>
              <span className="font-semibold text-base">
                {selectedPlan.display} / month
              </span>
            </div>
          </CardBody>
        </Card>
      )}

      {isSavingDetails && (
        <p className="text-sm text-default-500 text-center">
          Saving your details, please wait…
        </p>
      )}

      {paymentError && (
        <p className="text-sm text-danger text-center">{paymentError}</p>
      )}

      <Button
        fullWidth
        color={isLegacyMigrated ? "primary" : "success"}
        size="lg"
        isLoading={isPaymentLoading || isSavingDetails}
        isDisabled={!selectedPlan || isPaymentLoading || isSavingDetails}
        onPress={onPay}
      >
        {isPaymentLoading
          ? "Activating…"
          : isSavingDetails
            ? "Please wait…"
            : isLegacyMigrated
              ? "Activate Account"
              : `Pay ${selectedPlan?.display ?? ""}`}
      </Button>
    </div>
  );
}

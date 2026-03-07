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
}

export default function PaymentStep({
  plan,
  isPaymentLoading,
  paymentError,
  onPay,
  isSavingDetails = false,
}: PaymentStepProps) {
  const selectedPlan = PLANS.find((p) => p.value === plan);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-center">Complete Payment</h2>

      {selectedPlan && (
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
        color="success"
        size="lg"
        isLoading={isPaymentLoading || isSavingDetails}
        isDisabled={!selectedPlan || isPaymentLoading || isSavingDetails}
        onPress={onPay}
      >
        {isPaymentLoading
          ? "Processing…"
          : isSavingDetails
            ? "Please wait…"
            : `Pay ${selectedPlan?.display ?? ""}`}
      </Button>
    </div>
  );
}

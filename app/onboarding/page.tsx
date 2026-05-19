"use client";
import Stepper, { Step } from "@/components/reactbits/ui/Stepper";
import { useState, useEffect, useRef } from "react";
import { useUser, useSession } from "@clerk/nextjs";
import * as Sentry from "@sentry/nextjs";
import {
  PhoneFields,
  AddressField,
  ExperienceField,
  QualificationField,
  BoardField,
  PlanSelection,
  PaymentStep,
  PLANS,
  onboardingStep1Schema,
} from "@/components/reactbits/onboarding/index";
import type {
  OnboardingFormData,
  PlanValue,
} from "@/components/reactbits/onboarding/index";
import { Sen } from "next/font/google";

function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (
      typeof (window as unknown as Record<string, unknown>).Razorpay !==
      "undefined"
    ) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Razorpay SDK"));
    document.body.appendChild(script);
  });
}

export default function Onboarding() {
  const { user } = useUser();
  const { session } = useSession();
  const [formData, setFormData] = useState<OnboardingFormData>({
    phone: "",
    whatsapp: "",
    sameAsPhone: false,
    address: "",
    teachingExp: "",
    jobExp: "",
    qualification: "",
    board: "",
    plan: "",
  });

  // Tracks which "outer" step the stepper is currently on so we can
  // conditionally hide the footer Complete button on step 3.
  const [currentStep, setCurrentStep] = useState(1);

  // Auto-deletion countdown (computed as createdAt + 30 days)
  const [deletionDeadline, setDeletionDeadline] = useState<Date | null>(null);
  const [countdown, setCountdown] = useState("");
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Pre-fill form from DB on mount
  useEffect(() => {
    const meta = (user as any)?.publicMetadata as Record<string, unknown> | undefined;
    const isAdmin =
      meta?.isAdmin === true ||
      meta?.role === "super_admin" ||
      meta?.aotfRole === "SUPER_ADMIN";

    if (isAdmin) return; // Admins don't need onboarding — avoid repeated calls

    fetch("/api/v1/onboarding")
      .then((r) => (r.ok ? r.json() : null))
      .then(
        (
          data: {
            onboardingDetails?: Record<string, string | null>;
            createdAt?: string | null;
            onboardingCompleted?: boolean;
            paymentPaidButNotOnboarded?: boolean;
          } | null
        ) => {
          // If the user already paid but onboardingCompleted is false, show contact admin
          if (data?.paymentPaidButNotOnboarded) {
            setPaymentPaidButNotOnboarded(true);
          }

          const d = data?.onboardingDetails;
          if (d) {
            setFormData((prev) => {
              const phone = d.phone ?? prev.phone;
              const whatsapp = d.whatsapp ?? prev.whatsapp;
              return {
                phone,
                whatsapp,
                sameAsPhone: !!phone && phone === whatsapp,
                address: d.address ?? prev.address,
                teachingExp: d.teachingExp ?? prev.teachingExp,
                jobExp: d.jobExp ?? prev.jobExp,
                qualification: d.qualification ?? prev.qualification,
                board: d.board ?? prev.board,
                plan: (d.plan as PlanValue) ?? prev.plan,
              };
            });
            setProfileSaved(true);
            if (d.plan) setOnboardingDetailsSaved(true);
          }
          if (data?.createdAt) {
            const deadline = new Date(
              new Date(data.createdAt).getTime() + 30 * 24 * 60 * 60 * 1000
            );
            setDeletionDeadline(deadline);
          }
        }
      )
      .catch(() => {
        /* silently ignore — form stays empty */
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Live countdown ticker
  useEffect(() => {
    if (!deletionDeadline) return;
    const tick = () => {
      const diff = deletionDeadline.getTime() - Date.now();
      if (diff <= 0) {
        setCountdown("Account will be deleted shortly.");
        if (countdownRef.current) clearInterval(countdownRef.current);
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hrs = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);
      setCountdown(
        `${days}d ${hrs.toString().padStart(2, "0")}h ${mins.toString().padStart(2, "0")}m ${secs.toString().padStart(2, "0")}s`
      );
    };
    tick();
    countdownRef.current = setInterval(tick, 1000);
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [deletionDeadline]);

  // Profile save state (fires on transition from step 1 → step 2)
  const [profileSaved, setProfileSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Onboarding details save state (fires on plan selection; gates step 2 → 3)
  const [onboardingDetailsSaved, setOnboardingDetailsSaved] = useState(false);
  const [isSavingOnboarding, setIsSavingOnboarding] = useState(false);
  const [onboardingDetailsError, setOnboardingDetailsError] = useState<
    string | null
  >(null);
  // Payment state
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Mismatch state: payment is "paid" but onboardingCompleted is still false
  const [paymentPaidButNotOnboarded, setPaymentPaidButNotOnboarded] =
    useState(false);

  // ─── Helpers ──────────────────────────────────────────────────────

  const handleChange = (
    key: keyof OnboardingFormData,
    value: string | boolean
  ) => {
    setFormData((prev) => {
      const next: OnboardingFormData = {
        ...prev,
        [key]: value,
        ...(key === "sameAsPhone" && value === true
          ? { whatsapp: prev.phone }
          : {}),
      };
      return next;
    });
    // If any step-1 field changes, mark profile and onboarding as needing re-save
    const step1Fields: (keyof OnboardingFormData)[] = [
      "phone",
      "whatsapp",
      "sameAsPhone",
      "address",
      "teachingExp",
      "jobExp",
      "qualification",
      "board",
    ];
    if (step1Fields.includes(key)) {
      setProfileSaved(false);
      setOnboardingDetailsSaved(false);
    }
    // When a plan is selected, immediately sync to onboardingDetails
    if (key === "plan" && typeof value === "string" && value) {
      setOnboardingDetailsSaved(false);
      saveOnboardingDetails(value);
    }
  };

  // ─── Profile save ─────────────────────────────────────────────────

  const saveProfile = async () => {
    setIsSaving(true);
    setSaveError(null);
    const meta = (user as any)?.publicMetadata as Record<string, unknown> | undefined;
    const isAdmin =
      meta?.isAdmin === true ||
      meta?.role === "super_admin" ||
      meta?.aotfRole === "SUPER_ADMIN";

    if (isAdmin) {
      setIsSaving(false);
      setProfileSaved(true);
      return;
    }
    try {
      const res = await fetch("/api/v1/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: formData.phone,
          whatsapp: formData.whatsapp,
          address: formData.address,
          teachingExp: formData.teachingExp,
          ...(formData.jobExp ? { jobExp: formData.jobExp } : {}),
          qualification: formData.qualification,
          board: formData.board,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const msg =
          (data as { error?: string }).error ??
          (res.status === 404
            ? "Your account is still being set up. Please wait a moment and try again."
            : "Failed to save details. Please try again.");
        throw new Error(msg);
      }

      setProfileSaved(true);
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : "Failed to save your details."
      );
    } finally {
      setIsSaving(false);
    }
  };

  // ─── Onboarding details save ──────────────────────────────────────

  const saveOnboardingDetails = async (planOverride?: string) => {
    setIsSavingOnboarding(true);
    setOnboardingDetailsError(null);
    const meta = (user as any)?.publicMetadata as Record<string, unknown> | undefined;
    const isAdmin =
      meta?.isAdmin === true ||
      meta?.role === "super_admin" ||
      meta?.aotfRole === "SUPER_ADMIN";

    if (isAdmin) {
      setIsSavingOnboarding(false);
      setOnboardingDetailsSaved(true);
      return;
    }
    // Use the explicit override first, then fall back to current state
    const planValue =
      planOverride !== undefined ? planOverride : formData.plan || undefined;
    try {
      const res = await fetch("/api/v1/onboarding", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: formData.phone,
          whatsapp: formData.whatsapp,
          address: formData.address,
          teachingExp: formData.teachingExp,
          ...(formData.jobExp ? { jobExp: formData.jobExp } : {}),
          qualification: formData.qualification,
          board: formData.board,
          ...(planValue ? { plan: planValue } : {}),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const msg =
          (data as { error?: string }).error ??
          (res.status === 404
            ? "Your account is still being set up. Please wait a moment and try again."
            : "Failed to save details. Please try again.");
        throw new Error(msg);
      }

      // Mark as saved — step-1 fields are now in sync; plan inclusion is separate
      setOnboardingDetailsSaved(true);
    } catch (err) {
      setOnboardingDetailsError(
        err instanceof Error ? err.message : "Failed to save your details."
      );
    } finally {
      setIsSavingOnboarding(false);
    }
  };

  // ─── Stepper callbacks ────────────────────────────────────────────
  // Fires after Stepper already moved to `step`
  const handleStepChange = (step: number) => {
    setCurrentStep(step);
    // Save step-1 data when arriving at step 2 or 3 — only if something changed
    if ((step === 2 || step === 3) && !profileSaved && !isSaving) {
      saveProfile();
    }
    // Sync step-1 fields to onboardingDetails when arriving at step 2 or 3
    if (
      (step === 2 || step === 3) &&
      !onboardingDetailsSaved &&
      !isSavingOnboarding
    ) {
      saveOnboardingDetails(formData.plan || undefined);
    }
  };
  // Sync validation used by Stepper to gate the Next/Complete button
  const validateStep = (step: number): boolean => {
    if (step === 1) {
      const result = onboardingStep1Schema.safeParse({
        phone: formData.phone,
        whatsapp: formData.whatsapp,
        address: formData.address,
        teachingExp: formData.teachingExp,
        jobExp: formData.jobExp || undefined,
        qualification: formData.qualification,
        board: formData.board,
      });
      return result.success;
    }
    if (step === 2) {
      // Must have a plan selected. Profile and onboarding saves are async,
      // so also allow through if the saves are still in-flight (they'll
      // complete before the user can pay on step 3).
      return (
        !!formData.plan &&
        (profileSaved || isSaving) &&
        (onboardingDetailsSaved || isSavingOnboarding)
      );
    }
    // Step 3: block the Stepper's "Complete" button — payment is handled by
    // the custom Pay button inside the step content.
    return false;
  };

  // ─── Payment flow ─────────────────────────────────────────────────
  const handlePayment = async () => {
    if (!formData.plan) {
      setPaymentError("Please select a plan first.");
      return;
    }
    if (!user) {
      setPaymentError(
        "Session expired. Please refresh the page and try again."
      );
      return;
    }

    setIsPaymentLoading(true);
    setPaymentError(null);

    try {
      // 1. Create Razorpay order
      const orderRes = await fetch("/api/v1/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: formData.plan }),
      });

      if (!orderRes.ok) {
        const d = await orderRes.json().catch(() => ({}));
        throw new Error(
          (d as { error?: string }).error ?? "Failed to create order"
        );
      }

      const { orderId, amount, currency, key } = (await orderRes.json()) as {
        orderId: string;
        amount: number;
        currency: string;
        key: string;
      };

      // 2. Load Razorpay SDK
      await loadRazorpayScript();

      // 3. Open Razorpay checkout and await result
      const selectedPlan = PLANS.find((p) => p.value === formData.plan)!;

      await new Promise<void>((resolve, reject) => {
        const options = {
          key,
          amount,
          currency,
          name: "AOTF",
          description: selectedPlan.label,
          order_id: orderId,
          handler: async (response: {
            razorpay_order_id: string;
            razorpay_payment_id: string;
            razorpay_signature: string;
          }) => {
            try {
              // 4. Verify payment server-side
              const verifyRes = await fetch("/api/v1/payments/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  toPlan: formData.plan,
                }),
              });

              if (!verifyRes.ok) {
                const d = await verifyRes.json().catch(() => ({}));
                throw new Error(
                  (d as { error?: string }).error ??
                    "Payment verification failed"
                );
              }

              // 5. Refresh Clerk session so JWT carries updated onboardingCompleted
              await user.reload();

              // Force the session JWT to regenerate with new publicMetadata
              await session?.reload();

              // 6. Hard redirect so the proxy sees the fresh JWT
              window.location.href = `/u/${user.username}`;
              resolve();
            } catch (err) {
              reject(err);
            }
          },
          prefill: {
            contact: formData.phone,
          },
          modal: {
            ondismiss: () => reject(new Error("Payment cancelled")),
          },
        };

        const RazorpayClass = (
          window as unknown as {
            Razorpay: new (opts: unknown) => { open: () => void };
          }
        ).Razorpay;
        new RazorpayClass(options).open();
      });
    } catch (err) {
      if (err instanceof Error && err.message === "Payment cancelled") {
        // User closed the modal — not an error, just re-enable the button
      } else {
        setPaymentError(
          err instanceof Error
            ? err.message
            : "Payment failed. Please try again."
        );
      }
      Sentry.captureException(err, {
        tags: { feature: "onboarding", step: "payment" },
        extra: { formData },
      });
    } finally {
      setIsPaymentLoading(false);
    }
  };

  // ─── Derived ──────────────────────────────────────────────────────

  const selectedPlan = PLANS.find((p) => p.value === formData.plan);
  return (
    <section className="flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md mx-auto">
        {/* ── Payment received but onboarding not completed ────── */}
        {paymentPaidButNotOnboarded && (
          <div className="my-10 p-6 rounded-2xl bg-danger-50 border border-danger-200 text-center space-y-4">
            <div className="text-4xl">⚠️</div>
            <h2 className="text-xl font-bold text-danger-700">
              Payment Received — Account Pending
            </h2>
            <p className="text-sm text-danger-600">
              We have received your payment, but your account activation is
              still pending. This can happen due to a processing delay.
            </p>
            <p className="text-sm text-danger-600">
              Please contact the admin to get your account activated:
            </p>
            <div className="flex flex-col items-center gap-2 pt-2">
              <a
                href="mailto:support@aotf.in"
                className="text-primary font-semibold underline"
              >
                support@aotf.in
              </a>
              <a
                href="https://wa.me/919876543210"
                target="_blank"
                rel="noopener noreferrer"
                className="text-success font-semibold underline"
              >
                WhatsApp Support
              </a>
            </div>
            <p className="text-xs text-default-400 pt-2">
              Please keep your registered phone number and email handy when
              contacting support.
            </p>
          </div>
        )}

        {/* ── Normal onboarding flow ─────────────────────────────── */}
        {!paymentPaidButNotOnboarded && (
          <>
            {/* ── Auto-deletion warning ──────────────────────────────── */}
            {deletionDeadline && countdown && (
              <div className="mb-2 p-4 rounded-xl bg-warning-50 border border-warning-300 text-warning-800 text-sm space-y-1">
                <p className="font-semibold">
                  ⚠️ Account scheduled for deletion
                </p>
                <p>
                  Your account will be automatically deleted if payment is not
                  completed.
                </p>
                <p className="font-mono font-bold tracking-wide">{countdown}</p>
              </div>
            )}
            <Stepper
              className="mb-10"
              onStepChange={handleStepChange}
              validateStep={validateStep}
              checkStep={validateStep}
              nextButtonProps={
                currentStep === 3 ? { style: { display: "none" } } : {}
              }
            >
              {/* ── STEP 1: Personal & Professional Details ────────────── */}
              <Step>
                <div className="space-y-3">
                  <PhoneFields
                    phone={formData.phone}
                    whatsapp={formData.whatsapp}
                    sameAsPhone={formData.sameAsPhone}
                    onChange={handleChange}
                  />

                  <AddressField
                    value={formData.address}
                    onChange={(v) => handleChange("address", v)}
                  />

                  <ExperienceField
                    label="Teaching Experience"
                    value={formData.teachingExp}
                    isRequired
                    onChange={(v) => handleChange("teachingExp", v)}
                  />

                  <ExperienceField
                    label="Job Experience (optional)"
                    value={formData.jobExp}
                    onChange={(v) => handleChange("jobExp", v)}
                  />

                  <QualificationField
                    value={formData.qualification}
                    onChange={(v) => handleChange("qualification", v)}
                  />

                  <BoardField
                    value={formData.board}
                    onChange={(v) => handleChange("board", v)}
                  />
                </div>
              </Step>
              {/* ── STEP 2: Plan Selection ─────────────────────────────── */}
              <Step>
                <PlanSelection
                  selectedPlan={formData.plan}
                  onPlanChange={(plan) => handleChange("plan", plan)}
                  isSaving={isSaving}
                  isSavingOnboarding={isSavingOnboarding}
                  saveError={saveError}
                  onRetryProfile={saveProfile}
                  onboardingDetailsError={onboardingDetailsError}
                  onRetryOnboarding={() =>
                    saveOnboardingDetails(formData.plan || undefined)
                  }
                />
              </Step>
              {/* ── STEP 3: Payment ───────────────────────────────────── */}
              <Step>
                <PaymentStep
                  plan={formData.plan}
                  isPaymentLoading={isPaymentLoading}
                  paymentError={paymentError}
                  onPay={handlePayment}
                  isSavingDetails={isSaving || isSavingOnboarding}
                />
              </Step>
            </Stepper>
          </>
        )}
      </div>
    </section>
  );
}

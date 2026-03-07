"use client";
import Stepper, { Step } from "./ui/Stepper";
import { useState, useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Input, Textarea } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Checkbox } from "@heroui/checkbox";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";

const PLANS = [
  {
    value: "teacher",
    label: "Teacher Plan",
    amount: 4900,
    display: "₹49",
    description: "Access to tuition post feed and applications.",
  },
  {
    value: "teacher_candidate",
    label: "Teacher & Candidate Plan",
    amount: 9900,
    display: "₹99",
    description: "Full access: tuition posts + job/project applications.",
  },
] as const;

type PlanValue = (typeof PLANS)[number]["value"];

interface FormData {
  phone: string;
  whatsapp: string;
  sameAsPhone: boolean;
  address: string;
  teachingExp: string;
  jobExp: string;
  qualification: string;
  board: string;
  plan: PlanValue | "";
}

function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof (window as unknown as Record<string, unknown>).Razorpay !== "undefined") {
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
  const router = useRouter();

  const [formData, setFormData] = useState<FormData>({
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
    fetch("/api/v1/onboarding")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { onboardingDetails?: Record<string, string | null>; createdAt?: string | null } | null) => {
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
          const deadline = new Date(new Date(data.createdAt).getTime() + 30 * 24 * 60 * 60 * 1000);
          setDeletionDeadline(deadline);
        }
      })
      .catch(() => {/* silently ignore — form stays empty */});
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
      setCountdown(`${days}d ${hrs.toString().padStart(2, "0")}h ${mins.toString().padStart(2, "0")}m ${secs.toString().padStart(2, "0")}s`);
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
  const [onboardingDetailsError, setOnboardingDetailsError] = useState<string | null>(null);

  // Payment state
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // ─── Helpers ──────────────────────────────────────────────────────

  const handleChange = (key: keyof FormData, value: string | boolean) => {
    setFormData((prev) => {
      const next: FormData = {
        ...prev,
        [key]: value,
        ...(key === "sameAsPhone" && value === true
          ? { whatsapp: prev.phone }
          : {}),
      };
      return next;
    });
    // If any step-1 field changes, mark profile and onboarding as needing re-save
    const step1Fields: (keyof FormData)[] = [
      "phone", "whatsapp", "sameAsPhone", "address",
      "teachingExp", "jobExp", "qualification", "board",
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
        err instanceof Error ? err.message : "Failed to save your details.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  // ─── Onboarding details save ──────────────────────────────────────

  const saveOnboardingDetails = async (planOverride?: string) => {
    setIsSavingOnboarding(true);
    setOnboardingDetailsError(null);
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
        err instanceof Error ? err.message : "Failed to save your details.",
      );
    } finally {
      setIsSavingOnboarding(false);
    }
  };

  // ─── Stepper callbacks ────────────────────────────────────────────

  // Fires after Stepper already moved to `step`
  const handleStepChange = (step: number) => {
    setCurrentStep(step);
    // Save step-1 data when arriving at step 2 — only if something changed
    if (step === 2 && !profileSaved) {
      saveProfile();
    }
    // Sync step-1 fields to onboardingDetails when arriving at step 2 — only if something changed
    if (step === 2 && !onboardingDetailsSaved) {
      saveOnboardingDetails(formData.plan || undefined);
    }
  };

  // Sync validation used by Stepper to gate the Next/Complete button
  const validateStep = (step: number): boolean => {
    if (step === 1) {
      const { phone, whatsapp, address, teachingExp, qualification, board } =
        formData;
      return !!(phone && whatsapp && address && teachingExp && qualification && board);
    }
    if (step === 2) {
      // Must have a plan selected, profile saved, and onboarding details synced
      return profileSaved && onboardingDetailsSaved && !!formData.plan;
    }
    // Step 3: block the Stepper's "Complete" button — payment is handled by
    // the custom Pay button inside the step content.
    return false;
  };

  // ─── Payment flow ─────────────────────────────────────────────────

  const handlePayment = async () => {
    if (!user || !formData.plan) return;

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
        throw new Error((d as { error?: string }).error ?? "Failed to create order");
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
                  (d as { error?: string }).error ?? "Payment verification failed",
                );
              }

              // 5. Refresh Clerk session so JWT carries updated onboardingCompleted
              await user.reload();

              // 6. Redirect to the user's dashboard
              router.push(`/u/${user.username}`);
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
          err instanceof Error ? err.message : "Payment failed. Please try again.",
        );
      }
      setIsPaymentLoading(false);
    }
  };

  // ─── Derived ──────────────────────────────────────────────────────

  const selectedPlan = PLANS.find((p) => p.value === formData.plan);

  return (
    <div className="w-full max-w-md mx-auto py-10">
      {/* ── Auto-deletion warning ──────────────────────────────── */}
      {deletionDeadline && countdown && (
        <div className="mb-6 p-4 rounded-xl bg-warning-50 border border-warning-300 text-warning-800 text-sm space-y-1">
          <p className="font-semibold">⚠️ Account scheduled for deletion</p>
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
        // Hide the built-in "Complete" button on step 3; payment is handled
        // by the custom Pay button inside the step content.
        nextButtonProps={
          currentStep === 3 ? { style: { display: "none" } } : {}
        }
      >
        {/* ── STEP 1: Personal & Professional Details ────────────── */}
        <Step>
          <div className="space-y-5">
            <Input
              label="Phone Number"
              type="tel"
              isRequired
              maxLength={10}
              value={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
            />

            <Input
              label="WhatsApp Number"
              type="tel"
              isRequired
              maxLength={10}
              isDisabled={formData.sameAsPhone}
              value={formData.whatsapp}
              onChange={(e) => handleChange("whatsapp", e.target.value)}
            />

            <Checkbox
              isSelected={formData.sameAsPhone}
              onValueChange={(v) => handleChange("sameAsPhone", v)}
            >
              Same as phone number
            </Checkbox>

            <Textarea
              label="Your Address"
              isRequired
              maxLength={200}
              value={formData.address}
              onChange={(e) => handleChange("address", e.target.value)}
            />

            <Select
              label="Teaching Experience"
              isRequired
              selectedKeys={formData.teachingExp ? [formData.teachingExp] : []}
              onChange={(e) => handleChange("teachingExp", e.target.value)}
            >
              {(["0-1", "2-5", "6-10", "10+"] as const).map((v) => (
                <SelectItem key={v}>{v} years</SelectItem>
              ))}
            </Select>

            <Select
              label="Job Experience (optional)"
              selectedKeys={formData.jobExp ? [formData.jobExp] : []}
              onChange={(e) => handleChange("jobExp", e.target.value)}
            >
              {(["0-1", "2-5", "6-10", "10+"] as const).map((v) => (
                <SelectItem key={v}>{v} years</SelectItem>
              ))}
            </Select>

            <Input
              label="Highest Qualification"
              isRequired
              value={formData.qualification}
              onChange={(e) => handleChange("qualification", e.target.value)}
            />

            <Select
              label="School Board"
              isRequired
              selectedKeys={formData.board ? [formData.board] : []}
              onChange={(e) => handleChange("board", e.target.value)}
            >
              {(["CBSE", "ICSE", "WB"] as const).map((v) => (
                <SelectItem key={v}>{v}</SelectItem>
              ))}
            </Select>
          </div>
        </Step>

        {/* ── STEP 2: Plan Selection ─────────────────────────────── */}
        <Step>
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
                  onPress={saveProfile}
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
                  onPress={() => saveOnboardingDetails(formData.plan || undefined)}
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
                    formData.plan === plan.value
                      ? "border-primary"
                      : "border-default-200"
                  }`}
                  onPress={() => handleChange("plan", plan.value)}
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
        </Step>

        {/* ── STEP 3: Payment ───────────────────────────────────── */}
        <Step>
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-center">
              Complete Payment
            </h2>

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

            {paymentError && (
              <p className="text-sm text-danger text-center">{paymentError}</p>
            )}

            <Button
              fullWidth
              color="success"
              size="lg"
              isLoading={isPaymentLoading}
              isDisabled={!selectedPlan || isPaymentLoading}
              onPress={handlePayment}
            >
              {isPaymentLoading
                ? "Processing…"
                : `Pay ${selectedPlan?.display ?? ""}`}
            </Button>
          </div>
        </Step>
      </Stepper>
    </div>
  );
}


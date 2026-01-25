"use client";
import Stepper, { Step } from "./ui/Stepper";
import { useState } from "react";
import { Input, Textarea } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Checkbox } from "@heroui/checkbox";
import { Card, CardBody, CardHeader } from "@heroui/card";

import { Button } from "@heroui/button";

export default function Onboarding() {

  const [formData, setFormData] = useState({
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

  const handleChange = (key: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
      ...(key === "sameAsPhone" && value ? { whatsapp: prev.phone } : {}),
    }));
  };

  return (
    <div className="w-full max-w-md mx-auto py-10">
      <Stepper className="mb-10">
        <Step>
          {/* STEP 1 */}
          <div className="space-y-5">
            <Input
              label="Phone Number"
              type="number"
              isRequired
              value={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
            />

            <Input
              label="WhatsApp Number"
              type="number"
              isRequired
              value={formData.whatsapp}
              onChange={(e) => handleChange("whatsapp", e.target.value)}
            />

            <Checkbox
              isSelected={formData.sameAsPhone}
              onValueChange={(v) => handleChange("sameAsPhone", v)}
            >
              This phone number is my WhatsApp number
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
              selectedKeys={[formData.teachingExp]}
              onChange={(e) => handleChange("teachingExp", e.target.value)}
            >
              {["0-1", "2-5", "6-10", "10+"].map((v) => (
                <SelectItem key={v}>{v}</SelectItem>
              ))}
            </Select>

            <Select
              label="Job Experience"
              selectedKeys={[formData.jobExp]}
              onChange={(e) => handleChange("jobExp", e.target.value)}
            >
              {["0-1", "2-5", "6-10", "10+"].map((v) => (
                <SelectItem key={v}>{v}</SelectItem>
              ))}
            </Select>

            <Input
              label="Qualifications"
              isRequired
              value={formData.qualification}
              onChange={(e) => handleChange("qualification", e.target.value)}
            />

            <Select
              label="School Board"
              isRequired
              selectedKeys={[formData.board]}
              onChange={(e) => handleChange("board", e.target.value)}
            >
              {["CBSE", "ICSE", "WB"].map((v) => (
                <SelectItem key={v}>{v}</SelectItem>
              ))}
            </Select>
          </div>
        </Step>
        <Step>
          {/* STEP 2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { price: "49", label: "Basic Plan" },
              { price: "99", label: "Pro Plan" },
            ].map((plan) => (
              <Card
                key={plan.price}
                isPressable
                isHoverable
                className={`border ${
                  formData.plan === plan.price
                    ? "border-primary"
                    : "border-default"
                }`}
                onPress={() => handleChange("plan", plan.price)}
              >
                <CardHeader className="font-bold text-lg">
                  ₹{plan.price} / month
                </CardHeader>
                <CardBody>
                  <p>{plan.label}</p>
                </CardBody>
              </Card>
            ))}
          </div>
        </Step>
        <Step>
          {/* STEP 3 */}
          <div className="space-y-6 text-center">
            <h2 className="text-xl font-semibold">Payment</h2>

            <Card>
              <CardBody>
                <p className="mb-3">Selected Plan: ₹{formData.plan}</p>
                <Button
                  color="success"
                  onPress={() => {
                    alert("Integrate Razorpay here");
                  }}
                >
                  Pay with Razorpay
                </Button>
              </CardBody>
            </Card>
          </div>
        </Step>
      </Stepper>
    </div>
  );
}

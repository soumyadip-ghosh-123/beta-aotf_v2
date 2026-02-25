"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Input, Textarea } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Divider } from "@heroui/divider";
import { addToast } from "@heroui/toast";
import {
  ArrowLeft,
  Save,
  Briefcase,
  Building2,
  Phone,
  MapPin,
  Clock,
  GraduationCap,
  User,
  Users,
  FileText,
} from "lucide-react";
import { FaRupeeSign } from "react-icons/fa";

const WORK_TYPES = [
  { key: "job", label: "Job" },
  { key: "project", label: "Project" },
];

const COMPANY_TYPES = [
  { key: "individual", label: "Individual" },
  { key: "company", label: "Company" },
];

const LOCATION_TYPES = [
  { key: "remote", label: "Remote" },
  { key: "onsite", label: "On-Site" },
  { key: "hybrid", label: "Hybrid" },
];

const GENDER_PREFERENCES = [
  { key: "male", label: "Male" },
  { key: "female", label: "Female" },
  { key: "both", label: "Both" },
  { key: "all", label: "All" },
];

const PROJECT_TYPES = [
  { key: "one-time", label: "One-Time" },
  { key: "ongoing", label: "Ongoing" },
];

const COMMISSION_BASIS = [
  { key: "first_month", label: "First Month Salary" },
  { key: "project_value", label: "Project Value" },
];

export default function JobPostForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [workType, setWorkType] = useState<string>("job");
  const [title, setTitle] = useState("");
  const [clientName, setClientName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [companyType, setCompanyType] = useState<string>("company");
  const [locationType, setLocationType] = useState<string>("onsite");
  const [location, setLocation] = useState("");
  const [timing, setTiming] = useState("");
  const [experience, setExperience] = useState("");
  const [gender, setGender] = useState<string>("all");
  const [salary, setSalary] = useState("");
  const [requiredQualification, setRequiredQualification] = useState("");
  const [projectType, setProjectType] = useState<string>("");
  const [budget, setBudget] = useState("");
  const [duration, setDuration] = useState("");
  const [brief, setBrief] = useState("");
  const [commissionBasis, setCommissionBasis] = useState<string>("first_month");
  const [academyCommissionPercentage, setAcademyCommissionPercentage] =
    useState("");

  const handleSubmit = async () => {
    // Basic client-side validation
    if (!title.trim()) {
      addToast({ description: "Title is required", color: "danger" });
      return;
    }
    if (!clientName.trim()) {
      addToast({ description: "Client name is required", color: "danger" });
      return;
    }
    if (!phoneNumber.trim()) {
      addToast({ description: "Phone number is required", color: "danger" });
      return;
    }
    if (!location.trim()) {
      addToast({ description: "Location is required", color: "danger" });
      return;
    }
    if (!timing.trim()) {
      addToast({ description: "Timing is required", color: "danger" });
      return;
    }
    if (!academyCommissionPercentage.trim()) {
      addToast({
        description: "Commission percentage is required",
        color: "danger",
      });
      return;
    }
    if (workType === "project" && !projectType) {
      addToast({
        description: "Project type is required for project work type",
        color: "danger",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        workType,
        title: title.trim(),
        clientName: clientName.trim(),
        phoneNumber: phoneNumber.trim(),
        companyType,
        locationType,
        location: location.trim(),
        timing: timing.trim(),
        gender,
        commissionBasis,
        academyCommissionPercentage: parseInt(
          academyCommissionPercentage,
          10,
        ),
        status: "open" as const,
      };

      // Optional fields
      if (experience.trim()) payload.experience = experience.trim();
      if (salary.trim()) payload.salary = salary.trim();
      if (requiredQualification.trim())
        payload.requiredQualification = requiredQualification.trim();
      if (brief.trim()) payload.brief = brief.trim();

      // Project-specific fields
      if (workType === "project") {
        payload.projectType = projectType;
        if (budget.trim()) payload.budget = budget.trim();
        if (duration.trim()) payload.duration = duration.trim();
      }

      const res = await fetch("/api/v1/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        if (data.fieldErrors) {
          const messages = Object.entries(data.fieldErrors)
            .map(
              ([field, errors]) =>
                `${field}: ${(errors as string[]).join(", ")}`,
            )
            .join("; ");
          throw new Error(messages || data.error || "Validation failed");
        }
        throw new Error(data.error || "Failed to create job");
      }

      const data = await res.json();
      addToast({
        description: `Job ${data.job.jobId} created successfully!`,
        color: "success",
      });
      router.push("/admin/jobs");
      router.refresh();
    } catch (error) {
      addToast({
        description:
          error instanceof Error ? error.message : "Failed to create job",
        color: "danger",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 w-full max-w-3xl">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button
            isIconOnly
            variant="light"
            onPress={() => router.push("/admin/jobs")}
          >
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-default-900">
              Create Job Post
            </h1>
            <p className="text-default-500 text-sm">
              Fill in the details to create a new job or project post
            </p>
          </div>
        </div>

        {/* Work Type */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Briefcase size={18} className="text-primary" />
              <h2 className="text-lg font-semibold">Work Type</h2>
            </div>
          </CardHeader>
          <CardBody className="gap-4">
            <Select
              label="Work Type"
              placeholder="Select work type"
              selectedKeys={workType ? [workType] : []}
              onSelectionChange={(keys) => {
                const key = Array.from(keys)[0] as string;
                setWorkType(key || "job");
                // Reset project-specific fields when switching
                if (key === "job") {
                  setProjectType("");
                  setBudget("");
                  setDuration("");
                }
              }}
              isRequired
              variant="bordered"
            >
              {WORK_TYPES.map((wt) => (
                <SelectItem key={wt.key}>{wt.label}</SelectItem>
              ))}
            </Select>
          </CardBody>
        </Card>

        {/* Client Details */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Building2 size={18} className="text-primary" />
              <h2 className="text-lg font-semibold">Client Details</h2>
            </div>
          </CardHeader>
          <CardBody className="gap-4">
            <Input
              label="Client Name"
              placeholder="Enter client or company name"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              startContent={<User size={16} className="text-default-400" />}
              isRequired
              variant="bordered"
            />
            <Input
              label="Phone Number"
              placeholder="10-digit phone number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              startContent={<Phone size={16} className="text-default-400" />}
              isRequired
              variant="bordered"
              maxLength={10}
            />
            <Select
              label="Company Type"
              placeholder="Select company type"
              selectedKeys={companyType ? [companyType] : []}
              onSelectionChange={(keys) => {
                const key = Array.from(keys)[0] as string;
                setCompanyType(key || "company");
              }}
              isRequired
              variant="bordered"
            >
              {COMPANY_TYPES.map((ct) => (
                <SelectItem key={ct.key}>{ct.label}</SelectItem>
              ))}
            </Select>
          </CardBody>
        </Card>

        {/* Job / Project Details */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <FileText size={18} className="text-primary" />
              <h2 className="text-lg font-semibold">
                {workType === "project" ? "Project" : "Job"} Details
              </h2>
            </div>
          </CardHeader>
          <CardBody className="gap-4">
            <Input
              label="Title"
              placeholder={
                workType === "project"
                  ? "e.g. Website Development"
                  : "e.g. Senior Software Engineer"
              }
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              startContent={
                <Briefcase size={16} className="text-default-400" />
              }
              isRequired
              variant="bordered"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input
                label="Experience"
                placeholder="e.g. 3-5 years"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                variant="bordered"
              />
              <Input
                label="Required Qualification"
                placeholder="e.g. B.Tech/M.Tech"
                value={requiredQualification}
                onChange={(e) => setRequiredQualification(e.target.value)}
                startContent={
                  <GraduationCap size={16} className="text-default-400" />
                }
                variant="bordered"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Select
                label="Gender Preference"
                placeholder="Select gender preference"
                selectedKeys={gender ? [gender] : []}
                onSelectionChange={(keys) => {
                  const key = Array.from(keys)[0] as string;
                  setGender(key || "all");
                }}
                isRequired
                variant="bordered"
              >
                {GENDER_PREFERENCES.map((gp) => (
                  <SelectItem key={gp.key}>{gp.label}</SelectItem>
                ))}
              </Select>

              {workType === "job" && (
                <Input
                  label="Salary"
                  placeholder="e.g. ₹8-12 LPA"
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  startContent={
                    <FaRupeeSign size={14} className="text-default-400" />
                  }
                  variant="bordered"
                />
              )}
            </div>

            {/* Project-specific fields */}
            {workType === "project" && (
              <>
                <Divider />
                <p className="text-sm font-medium text-default-600">
                  Project-Specific Details
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Select
                    label="Project Type"
                    placeholder="Select project type"
                    selectedKeys={projectType ? [projectType] : []}
                    onSelectionChange={(keys) => {
                      const key = Array.from(keys)[0] as string;
                      setProjectType(key || "");
                    }}
                    isRequired
                    variant="bordered"
                  >
                    {PROJECT_TYPES.map((pt) => (
                      <SelectItem key={pt.key}>{pt.label}</SelectItem>
                    ))}
                  </Select>
                  <Input
                    label="Budget"
                    placeholder="e.g. ₹50,000"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    startContent={
                      <FaRupeeSign size={14} className="text-default-400" />
                    }
                    variant="bordered"
                  />
                </div>
                <Input
                  label="Duration"
                  placeholder="e.g. 3 months, 6 weeks"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  startContent={
                    <Clock size={16} className="text-default-400" />
                  }
                  variant="bordered"
                />
              </>
            )}

            <Textarea
              label="Brief (optional)"
              placeholder="Job description, responsibilities, requirements..."
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
              variant="bordered"
              minRows={3}
              maxRows={6}
            />
          </CardBody>
        </Card>

        {/* Location & Timing */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <MapPin size={18} className="text-primary" />
              <h2 className="text-lg font-semibold">Location & Timing</h2>
            </div>
          </CardHeader>
          <CardBody className="gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Select
                label="Location Type"
                placeholder="Select location type"
                selectedKeys={locationType ? [locationType] : []}
                onSelectionChange={(keys) => {
                  const key = Array.from(keys)[0] as string;
                  setLocationType(key || "onsite");
                }}
                isRequired
                variant="bordered"
              >
                {LOCATION_TYPES.map((lt) => (
                  <SelectItem key={lt.key}>{lt.label}</SelectItem>
                ))}
              </Select>
              <Input
                label="Location"
                placeholder="Enter work location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                startContent={
                  <MapPin size={16} className="text-default-400" />
                }
                isRequired
                variant="bordered"
              />
            </div>
            <Input
              label="Timing"
              placeholder="e.g. 10:00 AM - 7:00 PM, Flexible"
              value={timing}
              onChange={(e) => setTiming(e.target.value)}
              startContent={<Clock size={16} className="text-default-400" />}
              isRequired
              variant="bordered"
            />
          </CardBody>
        </Card>

        {/* Commission Details */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <FaRupeeSign size={16} className="text-primary" />
              <h2 className="text-lg font-semibold">Commission Details</h2>
            </div>
          </CardHeader>
          <CardBody className="gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Select
                label="Commission Basis"
                placeholder="Select commission basis"
                selectedKeys={commissionBasis ? [commissionBasis] : []}
                onSelectionChange={(keys) => {
                  const key = Array.from(keys)[0] as string;
                  setCommissionBasis(key || "first_month");
                }}
                isRequired
                variant="bordered"
              >
                {COMMISSION_BASIS.map((cb) => (
                  <SelectItem key={cb.key}>{cb.label}</SelectItem>
                ))}
              </Select>
              <Input
                label="Academy Commission %"
                placeholder="e.g. 10"
                type="number"
                value={academyCommissionPercentage}
                onChange={(e) =>
                  setAcademyCommissionPercentage(e.target.value)
                }
                isRequired
                variant="bordered"
              />
            </div>
          </CardBody>
        </Card>

        {/* Submit */}
        <div className="flex justify-end gap-3 pb-6">
          <Button variant="flat" onPress={() => router.push("/admin/jobs")}>
            Cancel
          </Button>
          <Button
            color="primary"
            startContent={<Save size={16} />}
            isLoading={isSubmitting}
            onPress={handleSubmit}
          >
            Create Job
          </Button>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Input, Textarea } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Divider } from "@heroui/divider";
import { Spinner } from "@heroui/spinner";
import { addToast } from "@heroui/toast";
import {
  ArrowLeft,
  Save,
  X,
  Briefcase,
  Building2,
  Phone,
  MapPin,
  Clock,
  GraduationCap,
  FileText,
  User,
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

const JOB_STATUSES = [
  { key: "open", label: "Open" },
  { key: "closed", label: "Closed" },
  { key: "hold", label: "Hold" },
  { key: "cancelled", label: "Cancelled" },
];

export default function EditJobPostPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    workType: "job",
    title: "",
    clientName: "",
    phoneNumber: "",
    companyType: "company",
    locationType: "onsite",
    location: "",
    timing: "",
    experience: "",
    gender: "all",
    salary: "",
    requiredQualification: "",
    projectType: "",
    budget: "",
    duration: "",
    brief: "",
    status: "open",
    commissionBasis: "first_month",
    academyCommissionPercentage: "",
  });

  useEffect(() => {
    const fetchJob = async () => {
      setIsLoading(true);
      setFetchError(null);
      try {
        const res = await fetch(`/api/v1/jobs/${postId}`);
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || `Failed to fetch job (${res.status})`);
        }
        const { job } = await res.json();
        setFormData({
          workType: job.workType || "job",
          title: job.title || "",
          clientName: job.clientName || "",
          phoneNumber: job.phoneNumber || "",
          companyType: job.companyType || "company",
          locationType: job.locationType || "onsite",
          location: job.location || "",
          timing: job.timing || "",
          experience: job.experience || "",
          gender: job.gender || "all",
          salary: job.salary || "",
          requiredQualification: job.requiredQualification || "",
          projectType: job.projectType || "",
          budget: job.budget || "",
          duration: job.duration || "",
          brief: job.brief || "",
          status: job.status || "open",
          commissionBasis: job.commissionBasis || "first_month",
          academyCommissionPercentage:
            job.academyCommissionPercentage?.toString() || "",
        });
      } catch (err) {
        setFetchError(
          err instanceof Error ? err.message : "Failed to fetch job"
        );
      } finally {
        setIsLoading(false);
      }
    };
    fetchJob();
  }, [postId]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleBack = () => {
    router.push(`/admin/jobs/${postId}`);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload: Record<string, unknown> = {
        workType: formData.workType,
        title: formData.title.trim(),
        clientName: formData.clientName.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        companyType: formData.companyType,
        locationType: formData.locationType,
        location: formData.location.trim(),
        timing: formData.timing.trim(),
        gender: formData.gender,
        status: formData.status,
        commissionBasis: formData.commissionBasis,
        academyCommissionPercentage: parseInt(
          formData.academyCommissionPercentage,
          10
        ),
      };

      // Optional fields
      if (formData.experience.trim())
        payload.experience = formData.experience.trim();
      if (formData.salary.trim()) payload.salary = formData.salary.trim();
      if (formData.requiredQualification.trim())
        payload.requiredQualification =
          formData.requiredQualification.trim();
      if (formData.brief.trim()) payload.brief = formData.brief.trim();

      // Project-specific fields
      if (formData.workType === "project") {
        if (formData.projectType)
          payload.projectType = formData.projectType;
        if (formData.budget.trim()) payload.budget = formData.budget.trim();
        if (formData.duration.trim())
          payload.duration = formData.duration.trim();
      }

      const res = await fetch(`/api/v1/jobs/${postId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (data.fieldErrors) {
          const messages = Object.entries(data.fieldErrors)
            .map(
              ([field, errors]) =>
                `${field}: ${(errors as string[]).join(", ")}`
            )
            .join("; ");
          throw new Error(messages || data.error || "Validation failed");
        }
        throw new Error(data.error || "Failed to update job");
      }

      addToast({
        description: "Job post updated successfully!",
        color: "success",
      });

      router.push(`/admin/jobs/${postId}`);
    } catch (error) {
      addToast({
        description:
          error instanceof Error ? error.message : "Failed to update job post",
        color: "danger",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    router.push(`/admin/jobs/${postId}`);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-4xl flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <Button
          size="sm"
          variant="light"
          startContent={<ArrowLeft size={18} />}
          onPress={() => router.push("/admin/jobs")}
          className="mb-4"
        >
          Back to Posts
        </Button>
        <Card className="bg-danger-50">
          <CardBody className="py-10 text-center">
            <p className="text-danger">{fetchError}</p>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <Button
          size="sm"
          variant="light"
          startContent={<ArrowLeft size={18} />}
          onPress={handleBack}
          className="mb-4"
        >
          Back to Post
        </Button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-default-900">
              Edit Job Post
            </h1>
            <p className="text-sm text-default-500 mt-1">Post ID: {postId}</p>
          </div>
          <Chip
            size="lg"
            color={
              formData.status === "open"
                ? "success"
                : formData.status === "hold"
                  ? "warning"
                  : "danger"
            }
            variant="flat"
            className="capitalize"
          >
            {formData.status}
          </Chip>
        </div>
      </div>

      {/* Form */}
      <div className="space-y-6">
        {/* Work Type */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Briefcase size={20} className="text-primary" />
              <h2 className="text-xl font-bold">Work Type</h2>
            </div>
          </CardHeader>
          <Divider />
          <CardBody className="gap-4">
            <Select
              label="Work Type"
              placeholder="Select work type"
              selectedKeys={formData.workType ? [formData.workType] : []}
              onChange={(e) => handleChange("workType", e.target.value)}
              isRequired
            >
              {WORK_TYPES.map((type) => (
                <SelectItem key={type.key}>{type.label}</SelectItem>
              ))}
            </Select>
          </CardBody>
        </Card>

        {/* Client Details */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2 size={20} className="text-primary" />
              <h2 className="text-xl font-bold">Client Details</h2>
            </div>
          </CardHeader>
          <Divider />
          <CardBody className="gap-4">
            <Input
              label="Client Name"
              placeholder="Enter client or company name"
              value={formData.clientName}
              onChange={(e) => handleChange("clientName", e.target.value)}
              startContent={
                <User size={18} className="text-default-400" />
              }
              isRequired
            />
            <Input
              label="Phone Number"
              placeholder="Enter phone number"
              value={formData.phoneNumber}
              onChange={(e) => handleChange("phoneNumber", e.target.value)}
              startContent={<Phone size={18} className="text-default-400" />}
              isRequired
              maxLength={10}
            />
            <Select
              label="Company Type"
              placeholder="Select company type"
              selectedKeys={
                formData.companyType ? [formData.companyType] : []
              }
              onChange={(e) => handleChange("companyType", e.target.value)}
              isRequired
            >
              {COMPANY_TYPES.map((type) => (
                <SelectItem key={type.key}>{type.label}</SelectItem>
              ))}
            </Select>
          </CardBody>
        </Card>

        {/* Job / Project Details */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText size={20} className="text-primary" />
              <h2 className="text-xl font-bold">
                {formData.workType === "project" ? "Project" : "Job"} Details
              </h2>
            </div>
          </CardHeader>
          <Divider />
          <CardBody className="gap-4">
            <Input
              label="Title"
              placeholder="Enter job/project title"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              startContent={
                <Briefcase size={18} className="text-default-400" />
              }
              isRequired
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Experience"
                placeholder="e.g. 3-5 years"
                value={formData.experience}
                onChange={(e) => handleChange("experience", e.target.value)}
              />
              <Input
                label="Required Qualification"
                placeholder="e.g. B.Tech/M.Tech"
                value={formData.requiredQualification}
                onChange={(e) =>
                  handleChange("requiredQualification", e.target.value)
                }
                startContent={
                  <GraduationCap size={18} className="text-default-400" />
                }
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Gender Preference"
                placeholder="Select gender preference"
                selectedKeys={formData.gender ? [formData.gender] : []}
                onChange={(e) => handleChange("gender", e.target.value)}
                isRequired
              >
                {GENDER_PREFERENCES.map((gp) => (
                  <SelectItem key={gp.key}>{gp.label}</SelectItem>
                ))}
              </Select>

              {formData.workType === "job" && (
                <Input
                  label="Salary"
                  placeholder="e.g. ₹8-12 LPA"
                  value={formData.salary}
                  onChange={(e) => handleChange("salary", e.target.value)}
                  startContent={
                    <FaRupeeSign size={18} className="text-default-400" />
                  }
                />
              )}
            </div>

            {/* Project-specific fields */}
            {formData.workType === "project" && (
              <>
                <Divider />
                <p className="text-sm font-medium text-default-600">
                  Project-Specific Details
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select
                    label="Project Type"
                    placeholder="Select project type"
                    selectedKeys={
                      formData.projectType ? [formData.projectType] : []
                    }
                    onChange={(e) =>
                      handleChange("projectType", e.target.value)
                    }
                    isRequired
                  >
                    {PROJECT_TYPES.map((pt) => (
                      <SelectItem key={pt.key}>{pt.label}</SelectItem>
                    ))}
                  </Select>
                  <Input
                    label="Budget"
                    placeholder="e.g. ₹50,000"
                    value={formData.budget}
                    onChange={(e) => handleChange("budget", e.target.value)}
                    startContent={
                      <FaRupeeSign
                        size={18}
                        className="text-default-400"
                      />
                    }
                  />
                </div>
                <Input
                  label="Duration"
                  placeholder="e.g. 3 months, 6 weeks"
                  value={formData.duration}
                  onChange={(e) => handleChange("duration", e.target.value)}
                  startContent={
                    <Clock size={18} className="text-default-400" />
                  }
                />
              </>
            )}

            <Textarea
              label="Brief"
              placeholder="Job description, responsibilities, requirements..."
              value={formData.brief}
              onChange={(e) => handleChange("brief", e.target.value)}
              minRows={4}
            />
          </CardBody>
        </Card>

        {/* Location & Timing */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <MapPin size={20} className="text-primary" />
              <h2 className="text-xl font-bold">Location & Timing</h2>
            </div>
          </CardHeader>
          <Divider />
          <CardBody className="gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Location Type"
                placeholder="Select location type"
                selectedKeys={
                  formData.locationType ? [formData.locationType] : []
                }
                onChange={(e) =>
                  handleChange("locationType", e.target.value)
                }
                isRequired
              >
                {LOCATION_TYPES.map((type) => (
                  <SelectItem key={type.key}>{type.label}</SelectItem>
                ))}
              </Select>
              <Input
                label="Location"
                placeholder="Enter location"
                value={formData.location}
                onChange={(e) => handleChange("location", e.target.value)}
                startContent={
                  <MapPin size={18} className="text-default-400" />
                }
                isRequired
              />
            </div>
            <Input
              label="Timing"
              placeholder="e.g. 10:00 AM - 7:00 PM"
              value={formData.timing}
              onChange={(e) => handleChange("timing", e.target.value)}
              startContent={<Clock size={18} className="text-default-400" />}
              isRequired
            />
          </CardBody>
        </Card>

        {/* Commission Details */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FaRupeeSign size={18} className="text-primary" />
              <h2 className="text-xl font-bold">Commission Details</h2>
            </div>
          </CardHeader>
          <Divider />
          <CardBody className="gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Commission Basis"
                placeholder="Select commission basis"
                selectedKeys={
                  formData.commissionBasis ? [formData.commissionBasis] : []
                }
                onChange={(e) =>
                  handleChange("commissionBasis", e.target.value)
                }
                isRequired
              >
                {COMMISSION_BASIS.map((cb) => (
                  <SelectItem key={cb.key}>{cb.label}</SelectItem>
                ))}
              </Select>
              <Input
                label="Academy Commission %"
                placeholder="e.g. 10"
                type="number"
                value={formData.academyCommissionPercentage}
                onChange={(e) =>
                  handleChange("academyCommissionPercentage", e.target.value)
                }
                isRequired
              />
            </div>
          </CardBody>
        </Card>

        {/* Status */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-bold">Post Status</h2>
          </CardHeader>
          <Divider />
          <CardBody>
            <Select
              label="Status"
              placeholder="Select status"
              selectedKeys={formData.status ? [formData.status] : []}
              onChange={(e) => handleChange("status", e.target.value)}
              isRequired
            >
              {JOB_STATUSES.map((s) => (
                <SelectItem key={s.key}>{s.label}</SelectItem>
              ))}
            </Select>
          </CardBody>
        </Card>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            color="default"
            variant="bordered"
            startContent={<X size={18} />}
            onPress={handleCancel}
          >
            Cancel
          </Button>
          <Button
            color="primary"
            startContent={<Save size={18} />}
            onPress={handleSave}
            isLoading={isSaving}
          >
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}

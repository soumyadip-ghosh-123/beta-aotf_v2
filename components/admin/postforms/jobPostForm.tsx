"use client";

import { useState, useEffect } from "react";
import { Input, Textarea } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { RadioGroup, Radio } from "@heroui/radio";
import { addToast } from "@heroui/toast";
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
import {
  User,
  Phone,
  Building2,
  MapPin,
  Clock,
  Briefcase,
  GraduationCap,
  CheckCircle,
} from "lucide-react";
import { z } from "zod";
import Stepper, { Step } from "@/components/reactbits/ui/Stepper";
import { FaRupeeSign } from "react-icons/fa";
import { Enquiry } from "@/components/admin/enquiries/EnquiryCard";

type LocationType = "on-site" | "remote" | "hybrid";
type GenderPreference = "male" | "female" | "both" | "all" | "others";

// Zod validation schema
const jobPostSchema = z.object({
  clientName: z
    .string()
    .min(2, "Client name must be at least 2 characters")
    .max(50, "Client name must be at most 50 characters")
    .regex(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces"),
  clientPhone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian phone number"),
  companyName: z.string().optional(),
  companyType: z.string().optional(),
  designation: z.string().min(2, "Designation is required"),
  experience: z.string().optional(),
  locationType: z.enum(["on-site", "remote", "hybrid"]),
  location: z.string().min(3, "Location is required"),
  genderPreference: z.enum(["male", "female", "both", "all", "others"]),
  timing: z.string().optional(),
  salary: z.string().optional(),
  travelRequirements: z.string().optional(),
  requiredQualifications: z.string().optional(),
  skillsRequired: z.string().optional(),
  notes: z.string().optional(),
});

const companyTypes = [
  { key: "it", label: "IT/Software" },
  { key: "manufacturing", label: "Manufacturing" },
  { key: "consulting", label: "Consulting" },
  { key: "healthcare", label: "Healthcare" },
  { key: "education", label: "Education" },
  { key: "finance", label: "Finance/Banking" },
  { key: "retail", label: "Retail" },
  { key: "hospitality", label: "Hospitality" },
  { key: "construction", label: "Construction" },
  { key: "others", label: "Others" },
];

const experienceLevels = [
  { key: "0-1", label: "0-1 years (Fresher)" },
  { key: "1-3", label: "1-3 years" },
  { key: "3-5", label: "3-5 years" },
  { key: "5-10", label: "5-10 years" },  { key: "10+", label: "10+ years" },
];

interface JobPostFormProps {
  enquiry?: Enquiry | null;
}

export default function JobPostForm({ enquiry }: JobPostFormProps) {
  const [formData, setFormData] = useState({
    clientName: "",
    clientPhone: "",
    companyName: "",
    companyType: "",
    designation: "",
    experience: "",
    locationType: "on-site" as LocationType,
    location: "",
    genderPreference: "all" as GenderPreference,
    timing: "",
    salary: "",
    travelRequirements: "",
    requiredQualifications: "",
    skillsRequired: "",
    notes: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);

  // Pre-fill form data from enquiry if available
  useEffect(() => {
    if (enquiry) {
      setFormData((prev) => ({
        ...prev,
        clientName: enquiry.name || "",
        clientPhone: enquiry.phoneNumber || "",
        notes: enquiry.query ? `From enquiry: ${enquiry.query}` : "",
      }));
    }
  }, [enquiry]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validate = () => {
    try {
      jobPostSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.issues.forEach((issue) => {
          const path = issue.path.join(".");
          newErrors[path] = issue.message;
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  // Step-by-step validation
  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    try {
      switch (step) {
        case 1: // Client Details
          const step1Schema = z.object({
            clientName: jobPostSchema.shape.clientName,
            clientPhone: jobPostSchema.shape.clientPhone,
          });
          step1Schema.parse({
            clientName: formData.clientName,
            clientPhone: formData.clientPhone,
          });
          break;

        case 2: // Job Details
          const step2Schema = z.object({
            designation: jobPostSchema.shape.designation,
            locationType: jobPostSchema.shape.locationType,
            location: jobPostSchema.shape.location,
          });
          step2Schema.parse({
            designation: formData.designation,
            locationType: formData.locationType,
            location: formData.location,
          });
          break;        case 3: // Requirements & Preferences
          const step3Schema = z.object({
            genderPreference: jobPostSchema.shape.genderPreference,
          });
          step3Schema.parse({
            genderPreference: formData.genderPreference,
          });
          break;

        case 4: // Additional Details (no required fields)
          return true;

        case 5: // Review step (no validation needed)
          return true;

        default:
          return true;
      }

      // Clear errors for this step if validation passes
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        error.issues.forEach((issue) => {
          const path = issue.path.join(".");
          newErrors[path] = issue.message;
        });
        setErrors(newErrors);
        isValid = false;
      }

      // Show toast message
      addToast({
        description: "Please fill in all required fields correctly",
        color: "danger",
      });

      return isValid;
    }
  };
  const handleSubmit = () => {
    if (!validate()) {
      addToast({ description: "Please fix the errors", color: "danger" });
      return;
    }

    // Show success animation
    setShowSuccess(true);

    // Debug log - show all form data
    console.log("=== JOB POST SUBMISSION DEBUG ===");
    console.log("Timestamp:", new Date().toISOString());
    console.log("Form Data:", JSON.stringify(formData, null, 2));
    console.log("Client Name:", formData.clientName);
    console.log("Client Phone:", formData.clientPhone);
    console.log("Company Name:", formData.companyName || "Not specified");
    console.log("Company Type:", formData.companyType || "Not specified");
    console.log("Designation:", formData.designation);
    console.log("Experience:", formData.experience || "Not specified");
    console.log("Location Type:", formData.locationType);
    console.log("Location:", formData.location);
    console.log("Gender Preference:", formData.genderPreference);
    console.log("Timing:", formData.timing || "Not specified");
    console.log("Salary:", formData.salary || "Not specified");
    console.log("Travel Requirements:", formData.travelRequirements || "None");
    console.log(
      "Required Qualifications:",
      formData.requiredQualifications || "None"
    );
    console.log("Skills Required:", formData.skillsRequired || "None");
    console.log("Additional Notes:", formData.notes || "None");
    console.log("=====================================");

    addToast({
      description: "Job post created successfully",
      color: "success",
    });

    // Reset form after 2 seconds
    setTimeout(() => {
      setShowSuccess(false);
      setFormData({
        clientName: "",
        clientPhone: "",
        companyName: "",
        companyType: "",
        designation: "",
        experience: "",
        locationType: "on-site",
        location: "",
        genderPreference: "all",
        timing: "",
        salary: "",
        travelRequirements: "",
        requiredQualifications: "",
        skillsRequired: "",
        notes: "",
      });
    }, 2000);
  };

  return (
    <div className="w-full min-h-screen max-w-3xl mx-auto p-3">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 justify-center">
          <h3 className="text-xl font-bold">Create Job Post</h3>
        </div>
        <p className="text-sm text-default-500 text-center">
          Fill in the job details
        </p>
      </div>
      <div className="flex justify-center">
        <Stepper
          onFinalStepCompleted={handleSubmit}
          validateStep={validateStep}
          nextButtonText="Next Step"
          backButtonText="Previous"
        >
          {/* Step 1: Client Details */}
          <Step>
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-default-700">
                Client Details
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Client Name"
                  placeholder="Enter client name"
                  value={formData.clientName}
                  onChange={(e) => handleChange("clientName", e.target.value)}
                  isRequired
                  isInvalid={!!errors.clientName}
                  errorMessage={errors.clientName}
                  variant="bordered"
                  startContent={<User size={18} className="text-default-400" />}
                />
                <Input
                  label="Client Phone"
                  placeholder="Enter phone number"
                  type="tel"
                  value={formData.clientPhone}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    if (value.length <= 10) {
                      handleChange("clientPhone", value);
                    }
                  }}
                  isRequired
                  isInvalid={!!errors.clientPhone}
                  errorMessage={errors.clientPhone}
                  variant="bordered"
                  startContent={
                    <Phone size={18} className="text-default-400" />
                  }
                  maxLength={10}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Company Name"
                  placeholder="Enter company name"
                  value={formData.companyName}
                  onChange={(e) => handleChange("companyName", e.target.value)}
                  variant="bordered"
                  startContent={
                    <Building2 size={18} className="text-default-400" />
                  }
                />
                <Select
                  label="Company Type"
                  placeholder="Select company type"
                  selectedKeys={
                    formData.companyType ? [formData.companyType] : []
                  }
                  onChange={(e: any) =>
                    handleChange("companyType", e.target.value)
                  }
                  variant="bordered"
                  startContent={
                    <Building2 size={18} className="text-default-400" />
                  }
                >
                  {companyTypes.map((type) => (
                    <SelectItem key={type.key}>{type.label}</SelectItem>
                  ))}
                </Select>
              </div>
            </div>
          </Step>

          {/* Step 2: Job Details */}
          <Step>
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-default-700">
                Job Details
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Designation"
                  placeholder="e.g., Software Engineer"
                  value={formData.designation}
                  onChange={(e) => handleChange("designation", e.target.value)}
                  isRequired
                  isInvalid={!!errors.designation}
                  errorMessage={errors.designation}
                  variant="bordered"
                  startContent={
                    <Briefcase size={18} className="text-default-400" />
                  }
                />
                <Select
                  label="Experience Required"
                  placeholder="Select experience level"
                  selectedKeys={
                    formData.experience ? [formData.experience] : []
                  }
                  onChange={(e: any) =>
                    handleChange("experience", e.target.value)
                  }
                  variant="bordered"
                  startContent={
                    <GraduationCap size={18} className="text-default-400" />
                  }
                >
                  {experienceLevels.map((exp) => (
                    <SelectItem key={exp.key}>{exp.label}</SelectItem>
                  ))}
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-default-700">
                  Location Type <span className="text-danger">*</span>
                </label>
                <RadioGroup
                  value={formData.locationType}
                  onValueChange={(value) => handleChange("locationType", value)}
                  orientation="horizontal"
                >
                  <Radio value="on-site">On-Site</Radio>
                  <Radio value="remote">Remote</Radio>
                  <Radio value="hybrid">Hybrid</Radio>
                </RadioGroup>
              </div>

              <Input
                label="Location"
                placeholder="Enter job location"
                value={formData.location}
                onChange={(e) => handleChange("location", e.target.value)}
                isRequired
                isInvalid={!!errors.location}
                errorMessage={errors.location}
                variant="bordered"
                startContent={<MapPin size={18} className="text-default-400" />}
                description={
                  formData.locationType === "remote"
                    ? "Can be 'Work from Home' or specify region"
                    : "Enter specific location or city"
                }
              />
            </div>
          </Step>

          {/* Step 3: Requirements & Preferences */}
          <Step>
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-default-700">
                Requirements & Preferences
              </h4>

              <div className="space-y-2">
                <label className="text-sm font-medium text-default-700">
                  Gender Preference <span className="text-danger">*</span>
                </label>
                <RadioGroup
                  value={formData.genderPreference}
                  onValueChange={(value) =>
                    handleChange("genderPreference", value)
                  }
                  orientation="horizontal"
                >
                  <Radio value="male">Male</Radio>
                  <Radio value="female">Female</Radio>
                  <Radio value="both">Both</Radio>
                  <Radio value="all">All</Radio>
                  <Radio value="others">Others</Radio>
                </RadioGroup>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Working Hours/Timing"
                  placeholder="e.g., 9 AM - 6 PM"
                  value={formData.timing}
                  onChange={(e) => handleChange("timing", e.target.value)}
                  variant="bordered"
                  startContent={
                    <Clock size={18} className="text-default-400" />
                  }
                />
                <Input
                  label="Salary Range"
                  placeholder="e.g., 50000-80000"
                  type="text"
                  value={formData.salary}
                  onChange={(e) => {
                    // Allow numbers, hyphens, and forward slashes
                    const value = e.target.value.replace(/[^\d\-\/]/g, "");
                    handleChange("salary", value);
                  }}
                  variant="bordered"
                  startContent={
                    <FaRupeeSign size={18} className="text-default-400" />
                  }
                  description="Enter salary range or amount per month"
                />
              </div>

              <Textarea
                label="Required Qualifications"
                placeholder="e.g., Bachelor's degree in Computer Science, MBA..."
                value={formData.requiredQualifications}
                onChange={(e: any) =>
                  handleChange("requiredQualifications", e.target.value)
                }
                variant="bordered"
                minRows={3}
              />

              <Textarea
                label="Skills Required"
                placeholder="e.g., JavaScript, React, Node.js, Communication skills..."
                value={formData.skillsRequired}
                onChange={(e: any) =>
                  handleChange("skillsRequired", e.target.value)
                }
                variant="bordered"
                minRows={3}
              />
            </div>
          </Step>

          {/* Step 4: Additional Details */}
          <Step>
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-default-700">
                Additional Information
              </h4>

              <Textarea
                label="Travel Requirements"
                placeholder="Specify if the job requires any travel..."
                value={formData.travelRequirements}
                onChange={(e: any) =>
                  handleChange("travelRequirements", e.target.value)
                }
                variant="bordered"
                minRows={3}
              />              <Textarea
                label="Additional Notes"
                placeholder="Any other job details, benefits, perks, responsibilities..."
                value={formData.notes}
                onChange={(e: any) => handleChange("notes", e.target.value)}
                variant="bordered"
                minRows={4}
              />
            </div>
          </Step>

          {/* Step 5: Review & Confirm */}
          <Step>
            <div className="space-y-4">
              {showSuccess ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-success/20 flex items-center justify-center animate-in zoom-in duration-500">
                      <CheckCircle
                        size={64}
                        className="text-success animate-in zoom-in duration-700 delay-200"
                      />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-success animate-in fade-in duration-500 delay-300">
                    Job Post Created!
                  </h3>
                  <p className="text-default-500 animate-in fade-in duration-500 delay-400">
                    Your job post has been successfully created.
                  </p>
                </div>
              ) : (
                <>
                  <h4 className="text-lg font-semibold text-default-700">
                    Review Your Job Post
                  </h4>

                  <Card>
                    <CardBody className="gap-4">
                      {/* Client Information */}
                      <div>
                        <p className="text-sm font-semibold text-default-700 mb-2">
                          Client Information
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="text-default-500">Name:</span>{" "}
                            <span className="font-medium">
                              {formData.clientName}
                            </span>
                          </div>
                          <div>
                            <span className="text-default-500">Phone:</span>{" "}
                            <span className="font-medium">
                              {formData.clientPhone}
                            </span>
                          </div>
                          {formData.companyName && (
                            <div>
                              <span className="text-default-500">Company:</span>{" "}
                              <span className="font-medium">
                                {formData.companyName}
                              </span>
                            </div>
                          )}
                          {formData.companyType && (
                            <div>
                              <span className="text-default-500">Type:</span>{" "}
                              <Chip size="sm" variant="flat" color="primary">
                                {companyTypes.find(
                                  (t) => t.key === formData.companyType
                                )?.label || formData.companyType}
                              </Chip>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="border-t border-divider" />

                      {/* Job Details */}
                      <div>
                        <p className="text-sm font-semibold text-default-700 mb-2">
                          Job Details
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="text-default-500">
                              Designation:
                            </span>{" "}
                            <span className="font-medium">
                              {formData.designation}
                            </span>
                          </div>
                          {formData.experience && (
                            <div>
                              <span className="text-default-500">
                                Experience:
                              </span>{" "}
                              <span className="font-medium">
                                {experienceLevels.find(
                                  (e) => e.key === formData.experience
                                )?.label || formData.experience}
                              </span>
                            </div>
                          )}
                          <div>
                            <span className="text-default-500">Location:</span>{" "}
                            <span className="font-medium">
                              {formData.location}
                            </span>
                          </div>
                          <div>
                            <span className="text-default-500">Type:</span>{" "}
                            <Chip
                              size="sm"
                              variant="flat"
                              color="secondary"
                              className="capitalize"
                            >
                              {formData.locationType}
                            </Chip>
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-divider" />

                      {/* Requirements */}
                      <div>
                        <p className="text-sm font-semibold text-default-700 mb-2">
                          Requirements & Preferences
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="text-default-500">
                              Gender Preference:
                            </span>{" "}
                            <Chip
                              size="sm"
                              variant="flat"
                              className="capitalize"
                            >
                              {formData.genderPreference}
                            </Chip>
                          </div>
                          {formData.timing && (
                            <div>
                              <span className="text-default-500">Timing:</span>{" "}
                              <span className="font-medium">
                                {formData.timing}
                              </span>
                            </div>
                          )}
                          {formData.salary && (
                            <div>
                              <span className="text-default-500">Salary:</span>{" "}
                              <span className="font-medium text-success">
                                ₹{formData.salary}
                              </span>
                            </div>
                          )}
                        </div>
                        {formData.requiredQualifications && (
                          <div className="mt-2">
                            <span className="text-default-500">
                              Qualifications:
                            </span>
                            <p className="text-default-700 text-xs mt-1">
                              {formData.requiredQualifications}
                            </p>
                          </div>
                        )}
                        {formData.skillsRequired && (
                          <div className="mt-2">
                            <span className="text-default-500">Skills:</span>
                            <p className="text-default-700 text-xs mt-1">
                              {formData.skillsRequired}
                            </p>
                          </div>
                        )}
                      </div>

                      {(formData.travelRequirements || formData.notes) && (
                        <>
                          <div className="border-t border-divider" />
                          <div>
                            <p className="text-sm font-semibold text-default-700 mb-2">
                              Additional Information
                            </p>
                            {formData.travelRequirements && (
                              <div className="mb-2">
                                <span className="text-default-500 text-sm">
                                  Travel Requirements:
                                </span>
                                <p className="text-default-700 text-xs mt-1">
                                  {formData.travelRequirements}
                                </p>
                              </div>
                            )}
                            {formData.notes && (
                              <div>
                                <span className="text-default-500 text-sm">
                                  Notes:
                                </span>
                                <p className="text-default-700 text-xs mt-1">
                                  {formData.notes}
                                </p>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </CardBody>
                  </Card>

                  <div className="bg-warning/10 p-4 rounded-lg border border-warning/20">
                    <p className="text-sm text-warning-700">
                      <strong>Note:</strong> Please review all information
                      carefully before confirming. Once submitted, the job post
                      will be created.
                    </p>
                  </div>
                </>
              )}
            </div>
          </Step>
        </Stepper>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Input, Textarea } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Divider } from "@heroui/divider";
import { addToast } from "@heroui/toast";
import {
  ArrowLeft,
  Save,
  X,
  Briefcase,
  Building2,
  Phone,
  MapPin,
  DollarSign,
  Clock,
  GraduationCap,
} from "lucide-react";
import { FaRupeeSign } from "react-icons/fa";

// Sample data - replace with actual API call
const getJobPostData = (id: string) => {
  const posts: Record<string, any> = {
    "J-05022600": {
      id: "J-05022600",
      company: "Tech Solutions Pvt Ltd",
      companyPhone: "9876543210",
      designation: "Senior Software Engineer",
      experience: "3-5 years",
      location: "Salt Lake, Kolkata",
      salary: "₹8-12 LPA",
      jobType: "Full-time",
      locationType: "Hybrid",
      timing: "10:00 AM - 7:00 PM",
      qualification: "B.Tech/M.Tech in Computer Science",
      description: "",
      status: "open",
    },
    "J-04022600": {
      id: "J-04022600",
      company: "Digital Marketing Hub",
      companyPhone: "9123456789",
      designation: "Marketing Manager",
      experience: "5+ years",
      location: "Park Street, Kolkata",
      salary: "₹10-15 LPA",
      jobType: "Full-time",
      locationType: "On-site",
      timing: "9:00 AM - 6:00 PM",
      qualification: "MBA in Marketing",
      description:
        "Looking for an experienced marketing professional to lead our team",
      status: "open",
    },
    "J-03022600": {
      id: "J-03022600",
      company: "Analytics Pro",
      companyPhone: "9998887776",
      designation: "Senior Data Analyst",
      experience: "2-4 years",
      location: "New Town, Kolkata",
      salary: "₹6-9 LPA",
      jobType: "Full-time",
      locationType: "Remote",
      timing: "Flexible",
      qualification: "B.Sc/M.Sc in Statistics or related field",
      description: "Seeking a data analyst with strong statistical background",
      status: "filled",
    },
  };

  return posts[id] || null;
};

export default function EditJobPostPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;

  const existingPost = getJobPostData(postId);

  const [formData, setFormData] = useState({
    company: existingPost?.company || "",
    companyPhone: existingPost?.companyPhone || "",
    designation: existingPost?.designation || "",
    experience: existingPost?.experience || "",
    location: existingPost?.location || "",
    salary: existingPost?.salary || "",
    jobType: existingPost?.jobType || "Full-time",
    locationType: existingPost?.locationType || "On-site",
    timing: existingPost?.timing || "",
    qualification: existingPost?.qualification || "",
    description: existingPost?.description || "",
    status: existingPost?.status || "open",
  });

  const [isSaving, setIsSaving] = useState(false);

  if (!existingPost) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <Card>
          <CardBody>
            <p className="text-center text-danger">Post not found</p>
          </CardBody>
        </Card>
      </div>
    );
  }

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleBack = () => {
    router.push(`/admin/jobs/${postId}`);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // TODO: Replace with actual API call
      // await updateJobPost(postId, formData);

      addToast({
        description: "Job post updated successfully!",
        color: "success",
      });

      router.push(`/admin/jobs/${postId}`);
    } catch (error) {
      addToast({
        description: "Failed to update job post",
        color: "danger",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    router.push(`/admin/jobs/${postId}`);
  };

  const jobTypes = [
    "Full-time",
    "Part-time",
    "Contract",
    "Internship",
    "Freelance",
  ];
  const locationTypes = ["On-site", "Remote", "Hybrid"];
  const experienceLevels = [
    "0-1 years",
    "1-2 years",
    "2-4 years",
    "3-5 years",
    "5+ years",
    "10+ years",
  ];

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
                : formData.status === "filled"
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
        {/* Company Details */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2 size={20} className="text-primary" />
              <h2 className="text-xl font-bold">Company Details</h2>
            </div>
          </CardHeader>
          <Divider />
          <CardBody className="gap-4">
            <Input
              label="Company Name"
              placeholder="Enter company name"
              value={formData.company}
              onChange={(e) => handleChange("company", e.target.value)}
              startContent={
                <Building2 size={18} className="text-default-400" />
              }
              isRequired
            />
            <Input
              label="Company Phone"
              placeholder="Enter phone number"
              value={formData.companyPhone}
              onChange={(e) => handleChange("companyPhone", e.target.value)}
              startContent={<Phone size={18} className="text-default-400" />}
              isRequired
            />
          </CardBody>
        </Card>

        {/* Job Details */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Briefcase size={20} className="text-primary" />
              <h2 className="text-xl font-bold">Job Details</h2>
            </div>
          </CardHeader>
          <Divider />
          <CardBody className="gap-4">
            <Input
              label="Designation"
              placeholder="Enter job designation"
              value={formData.designation}
              onChange={(e) => handleChange("designation", e.target.value)}
              startContent={
                <Briefcase size={18} className="text-default-400" />
              }
              isRequired
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Experience Required"
                placeholder="Select experience level"
                selectedKeys={formData.experience ? [formData.experience] : []}
                onChange={(e) => handleChange("experience", e.target.value)}
                isRequired
              >
                {experienceLevels.map((exp) => (
                  <SelectItem key={exp}>{exp}</SelectItem>
                ))}
              </Select>

              <Input
                label="Location"
                placeholder="Enter job location"
                value={formData.location}
                onChange={(e) => handleChange("location", e.target.value)}
                startContent={<MapPin size={18} className="text-default-400" />}
                isRequired
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Salary Range"
                placeholder="e.g., ₹8-12 LPA"
                value={formData.salary}
                onChange={(e) => handleChange("salary", e.target.value)}
                startContent={
                  <FaRupeeSign size={18} className="text-default-400" />
                }
                isRequired
              />

              <Input
                label="Timing"
                placeholder="e.g., 10:00 AM - 7:00 PM"
                value={formData.timing}
                onChange={(e) => handleChange("timing", e.target.value)}
                startContent={<Clock size={18} className="text-default-400" />}
                isRequired
              />
            </div>

            <Input
              label="Qualification"
              placeholder="Enter required qualifications"
              value={formData.qualification}
              onChange={(e) => handleChange("qualification", e.target.value)}
              startContent={
                <GraduationCap size={18} className="text-default-400" />
              }
              isRequired
            />
          </CardBody>
        </Card>

        {/* Job Type & Location */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-bold">Job Type & Location</h2>
          </CardHeader>
          <Divider />
          <CardBody className="gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Job Type"
                placeholder="Select job type"
                selectedKeys={formData.jobType ? [formData.jobType] : []}
                onChange={(e) => handleChange("jobType", e.target.value)}
                isRequired
              >
                {jobTypes.map((type) => (
                  <SelectItem key={type}>{type}</SelectItem>
                ))}
              </Select>

              <Select
                label="Location Type"
                placeholder="Select location type"
                selectedKeys={
                  formData.locationType ? [formData.locationType] : []
                }
                onChange={(e) => handleChange("locationType", e.target.value)}
                isRequired
              >
                {locationTypes.map((type) => (
                  <SelectItem key={type}>{type}</SelectItem>
                ))}
              </Select>
            </div>
          </CardBody>
        </Card>

        {/* Job Description */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-bold">Job Description</h2>
          </CardHeader>
          <Divider />
          <CardBody className="gap-4">
            <Textarea
              label="Description"
              placeholder="Enter job description and requirements..."
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              minRows={6}
            />
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
              <SelectItem key="open">Open</SelectItem>
              <SelectItem key="closed">Closed</SelectItem>
              <SelectItem key="filled">Filled</SelectItem>
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

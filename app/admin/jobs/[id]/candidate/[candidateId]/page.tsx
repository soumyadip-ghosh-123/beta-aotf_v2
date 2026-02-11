"use client";

import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Avatar } from "@heroui/avatar";
import { Chip } from "@heroui/chip";
import { Button } from "@heroui/button";
import { Divider } from "@heroui/divider";
import { RadioGroup, Radio } from "@heroui/radio";
import { Textarea } from "@heroui/input";
import { addToast } from "@heroui/toast";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/modal";
import { User } from "@heroui/user";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Briefcase,
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  Trash2,
} from "lucide-react";

// Sample candidate data - replace with actual API call
const getCandidateData = (candidateId: string) => {
  const candidates: Record<string, any> = {
    JC001: {
      id: "JC001",
      name: "Rahul Sharma",
      email: "rahul.s@example.com",
      phone: "9876543210",
      avatar: undefined,
      qualification: "B.Tech in Computer Science",
      experience: "4 years",
      location: "Salt Lake, Kolkata",
      status: "approved",
      appliedDate: "2026-02-06",
      skills: ["React", "Node.js", "TypeScript", "MongoDB", "AWS", "Docker"],
      currentCompany: "Infosys Limited",
      currentRole: "Senior Software Developer",
      noticePeriod: "30 days",
      expectedSalary: "₹10-12 LPA",
      bio: "Experienced software engineer with a strong background in full-stack development. Passionate about building scalable applications and working with modern technologies.",
      statusHistory: [
        {
          status: "pending",
          date: "2026-02-06",
          notes: "Application received",
        },
        {
          status: "approved",
          date: "2026-02-09",
          notes:
            "Candidate approved after successful interview rounds. Offer letter sent.",
        },
      ],
    },
    JC002: {
      id: "JC002",
      name: "Priya Patel",
      email: "priya.p@example.com",
      phone: "9876543211",
      avatar: undefined,
      qualification: "M.Tech in Software Engineering",
      experience: "5 years",
      location: "Park Street, Kolkata",
      status: "pending",
      appliedDate: "2026-02-07",
      skills: ["Java", "Spring Boot", "Microservices", "Docker", "Kubernetes"],
      currentCompany: "TCS",
      currentRole: "Tech Lead",
      noticePeriod: "60 days",
      expectedSalary: "₹15-18 LPA",
      bio: "Seasoned software architect with expertise in designing and implementing enterprise-level applications using Java and Spring ecosystem.",
      statusHistory: [
        {
          status: "pending",
          date: "2026-02-07",
          notes: "Application received. Resume screening in progress.",
        },
      ],
    },
    JC003: {
      id: "JC003",
      name: "Amit Kumar",
      email: "amit.k@example.com",
      phone: "9876543212",
      avatar: undefined,
      qualification: "B.Tech in IT",
      experience: "3 years",
      location: "New Town, Kolkata",
      status: "pending",
      appliedDate: "2026-02-08",
      skills: ["Python", "Django", "PostgreSQL", "Redis", "AWS"],
      currentCompany: "Wipro",
      currentRole: "Software Engineer",
      noticePeriod: "45 days",
      expectedSalary: "₹8-10 LPA",
      bio: "Backend developer specializing in Python and Django framework. Strong experience in building RESTful APIs and database optimization.",
      statusHistory: [
        {
          status: "pending",
          date: "2026-02-08",
          notes: "Application received",
        },
      ],
    },
  };

  return candidates[candidateId] || null;
};

export default function JobCandidateDetailPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;
  const candidateId = params.candidateId as string;
  const candidate = getCandidateData(candidateId);
  const [selectedStatus, setSelectedStatus] = useState<string>(
    candidate?.status || "pending"
  );
  const [notes, setNotes] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  if (!candidate) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <Card>
          <CardBody>
            <p className="text-center text-danger">Candidate not found</p>
          </CardBody>
        </Card>
      </div>
    );
  }

  const handleBack = () => {
    router.push(`/admin/jobs/${postId}`);
  };

  const handleDeleteCandidate = async () => {
    setIsDeleting(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // TODO: Replace with actual API call
      // await deleteCandidate(postId, candidateId);

      addToast({
        description: "Candidate deleted successfully!",
        color: "success",
      });

      // Navigate back to candidates list
      router.push(`/admin/jobs/${postId}`);
    } catch (error) {
      addToast({
        description: "Failed to delete candidate",
        color: "danger",
      });
      setIsDeleting(false);
    } finally {
      onClose();
    }
  };

  const handleUpdateStatus = async () => {
    setIsUpdating(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      addToast({
        description: "Status updated successfully!",
        color: "success",
      });

      // Update the status history (in real app, this would come from API)
      candidate.statusHistory.push({
        status: selectedStatus,
        date: new Date().toISOString().split("T")[0],
        notes: notes,
      });

      setNotes("");
    } catch (error) {
      addToast({
        description: "Failed to update status",
        color: "danger",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "warning";
      case "approved":
        return "success";
      case "declined":
        return "danger";
      case "withdrawn":
        return "default";
      default:
        return "default";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "Pending";
      case "approved":
        return "Approved";
      case "declined":
        return "Declined";
      case "withdrawn":
        return "Withdrawn";
      default:
        return status;
    }
  };

  // Recruitment checkpoints for jobs
  const checkpoints = [
    { id: "pending", label: "Application Received", status: "pending" },
    { id: "approved", label: "Approved", status: "approved" },
  ];

  const getCheckpointStatus = (checkpointStatus: string) => {
    const statusOrder = ["pending", "approved"];
    const currentIndex = statusOrder.indexOf(candidate.status);
    const checkpointIndex = statusOrder.indexOf(checkpointStatus);

    if (checkpointIndex < currentIndex) return "completed";
    if (checkpointIndex === currentIndex) return "current";
    return "pending";
  };
  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Header with Back and Delete Buttons */}
      <div className="flex items-center justify-between mb-4">
        <Button
          size="sm"
          variant="light"
          startContent={<ArrowLeft size={18} />}
          onPress={handleBack}
        >
          Back to Candidates
        </Button>
        <Button
          size="sm"
          color="danger"
          variant="flat"
          startContent={<Trash2 size={18} />}
          onPress={onOpen}
        >
          Delete Candidate
        </Button>
      </div>

      {/* Candidate Profile Card */}
      <Card className="mb-6">
        <CardHeader className="flex-col items-start gap-3 pb-4">
          <div className="flex items-start justify-between gap-4 w-full">
            <User
              avatarProps={{
                src: candidate.avatar,
              }}
              name={candidate.name}
              description={`Email: ${candidate.email}`}
            />
            <Chip
              size="sm"
              color={getStatusColor(candidate.status)}
              variant="flat"
              className="font-semibold"
            >
              {getStatusLabel(candidate.status)}
            </Chip>
          </div>
        </CardHeader>

        <Divider />

        <CardBody className="gap-4">
          {/* Contact Information - Prominent Display */}
          <div className="bg-primary-50 dark:bg-primary-900/10 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-default-700 mb-3">
              Contact Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                  <Phone size={18} className="text-primary-600" />
                </div>
                <div>
                  <p className="text-xs text-default-500">Phone Number</p>
                  <a
                    href={`tel:${candidate.phone}`}
                    className="font-semibold text-primary-600 hover:underline text-lg"
                  >
                    {candidate.phone}
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-secondary-100 dark:bg-secondary-900/30 flex items-center justify-center">
                  <Mail size={18} className="text-secondary-600" />
                </div>
                <div>
                  <p className="text-xs text-default-500">Email Address</p>
                  <a
                    href={`mailto:${candidate.email}`}
                    className="font-semibold text-secondary-600 hover:underline"
                  >
                    {candidate.email}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Professional Information */}
          {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <MapPin size={18} className="text-default-400" />
              <div>
                <p className="text-xs text-default-500">Location</p>
                <p className="font-medium text-default-700">
                  {candidate.location}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <GraduationCap size={18} className="text-default-400" />
              <div>
                <p className="text-xs text-default-500">Qualification</p>
                <p className="font-medium text-default-700">
                  {candidate.qualification}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Briefcase size={18} className="text-default-400" />
              <div>
                <p className="text-xs text-default-500">Experience</p>
                <p className="font-medium text-default-700">
                  {candidate.experience}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar size={18} className="text-default-400" />
              <div>
                <p className="text-xs text-default-500">Applied Date</p>
                <p className="font-medium text-default-700">
                  {new Date(candidate.appliedDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div> */}

          {/* <Divider /> */}

          {/* Current Employment */}
          {/* <div className="space-y-3">
            <h3 className="text-sm font-semibold text-default-700">
              Current Employment
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-default-500">Company</p>
                <p className="font-medium text-default-700">
                  {candidate.currentCompany}
                </p>
              </div>
              <div>
                <p className="text-xs text-default-500">Role</p>
                <p className="font-medium text-default-700">
                  {candidate.currentRole}
                </p>
              </div>
              <div>
                <p className="text-xs text-default-500">Notice Period</p>
                <p className="font-medium text-default-700">
                  {candidate.noticePeriod}
                </p>
              </div>
              <div>
                <p className="text-xs text-default-500">Expected Salary</p>
                <p className="font-medium text-success-600">
                  {candidate.expectedSalary}
                </p>
              </div>
            </div>
          </div> */}

          {/* <Divider /> */}

          {/* Skills */}
          {/* <div className="space-y-3">
            <h3 className="text-sm font-semibold text-default-700">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {candidate.skills.map((skill: string) => (
                <Chip key={skill} size="sm" variant="flat" color="primary">
                  {skill}
                </Chip>
              ))}
            </div>
          </div>

          {candidate.bio && (
            <>
              <Divider />
              <div>
                <p className="text-sm font-semibold text-default-700 mb-2">
                  About
                </p>
                <p className="text-sm text-default-600">{candidate.bio}</p>
              </div>
            </>
          )} */}
        </CardBody>
      </Card>

      {/* Recruitment Process Checkpoints */}
      <Card className="mb-6">
        <CardHeader>
          <h2 className="text-xl font-bold">Recruitment Process</h2>
        </CardHeader>
        <Divider />
        <CardBody>
          <div className="relative">
            {/* Progress Line */}
            <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-default-200" />

            {/* Checkpoints */}
            <div className="space-y-6">
              {checkpoints.map((checkpoint, index) => {
                const status = getCheckpointStatus(checkpoint.status);
                const isCompleted = status === "completed";
                const isCurrent = status === "current";

                return (
                  <div key={checkpoint.id} className="relative flex gap-4">
                    {/* Checkpoint Icon */}
                    <div className="relative z-10">
                      {isCompleted ? (
                        <div className="w-12 h-12 rounded-full bg-success flex items-center justify-center">
                          <CheckCircle2 size={24} className="text-white" />
                        </div>
                      ) : isCurrent ? (
                        <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center animate-pulse">
                          <Clock size={24} className="text-white" />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-default-200 flex items-center justify-center">
                          <Circle size={24} className="text-default-400" />
                        </div>
                      )}
                    </div>

                    {/* Checkpoint Content */}
                    <div className="flex flex-col justify-center">
                      <h3
                        className={`font-semibold ${
                          isCompleted || isCurrent
                            ? "text-default-900"
                            : "text-default-400"
                        }`}
                      >
                        {checkpoint.label}
                      </h3>

                      {/* Show history for this checkpoint if it exists */}
                      {candidate.statusHistory
                        .filter((h: any) => h.status === checkpoint.status)
                        .map((history: any, idx: number) => (
                          <p className="text-sm text-default-500">
                            {new Date(history.date).toLocaleDateString()}
                          </p>
                        ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Update Status Card */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-bold">Update Candidate Status</h2>
        </CardHeader>
        <Divider />
        <CardBody className="gap-4">
          <RadioGroup
            label="Select Status"
            value={selectedStatus}
            onValueChange={setSelectedStatus}
          >
            <Radio value="pending">Pending</Radio>
            <Radio value="approved">Approved</Radio>
            <Radio value="declined">Declined</Radio>
            <Radio value="withdrawn">Withdrawn</Radio>
          </RadioGroup>

          <Textarea
            label="Notes"
            placeholder="Add notes about this status update..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            minRows={3}
          />          <Button
            color="primary"
            onPress={handleUpdateStatus}
            isLoading={isUpdating}
            isDisabled={selectedStatus === candidate.status && !notes}
          >
            Update Status
          </Button>
        </CardBody>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            Delete Candidate
          </ModalHeader>
          <ModalBody>
            <p>
              Are you sure you want to delete <strong>{candidate.name}</strong>?
            </p>
            <p className="text-sm text-danger">
              This action cannot be undone. The candidate will be permanently
              removed from this job post.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onClose}>
              Cancel
            </Button>
            <Button
              color="danger"
              onPress={handleDeleteCandidate}
              isLoading={isDeleting}
            >
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}

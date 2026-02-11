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
import { User } from "@heroui/user";
// Sample candidate data - replace with actual API call
const getCandidateData = (candidateId: string) => {
  const candidates: Record<string, any> = {
    C001: {
      id: "C001",
      name: "Sarah Jenkins",
      email: "sarah.j@example.com",
      phone: "9876543210",
      avatar: undefined,
      qualification: "B.Ed in Mathematics",
      experience: "5 years",
      location: "Salt Lake, Kolkata",
      status: "approved",
      appliedDate: "2026-02-01",
      subjects: ["Mathematics", "Physics", "Chemistry"],
      teachingMode: "Both Online & Offline",
      preferredLocations: ["Salt Lake", "New Town", "Rajarhat"],
      bio: "Passionate mathematics teacher with 5 years of experience in teaching CBSE and ICSE curriculum. Expert in making complex concepts easy to understand.",
      statusHistory: [
        {
          status: "pending",
          date: "2026-02-01",
          notes: "Application received",
        },
        {
          status: "DC",
          date: "2026-02-03",
          notes: "Demo class scheduled for Feb 5, 2026",
        },
        {
          status: "GC",
          date: "2026-02-06",
          notes: "Guardian satisfied with demo class. Awaiting final decision.",
        },
        {
          status: "approved",
          date: "2026-02-08",
          notes: "Approved by guardian. Classes to start from Feb 15, 2026.",
        },
      ],
    },
    C002: {
      id: "C002",
      name: "Michael Chen",
      email: "michael.c@example.com",
      phone: "9876543211",
      avatar: undefined,
      qualification: "M.Sc Mathematics",
      experience: "3 years",
      location: "Park Street, Kolkata",
      status: "DC",
      appliedDate: "2026-02-02",
      subjects: ["Mathematics", "Statistics"],
      teachingMode: "Online Only",
      preferredLocations: ["Park Street", "Esplanade", "Dharmatala"],
      bio: "Recent M.Sc graduate specializing in advanced mathematics and statistics. Enthusiastic about teaching and helping students excel.",
      statusHistory: [
        {
          status: "pending",
          date: "2026-02-02",
          notes: "Application received",
        },
        {
          status: "DC",
          date: "2026-02-08",
          notes: "Demo class scheduled for Feb 12, 2026",
        },
      ],
    },
    C003: {
      id: "C003",
      name: "Amanda Rose",
      email: "amanda.r@example.com",
      phone: "9876543212",
      avatar: undefined,
      qualification: "B.Sc in Physics",
      experience: "2 years",
      location: "Howrah, Kolkata",
      status: "GC",
      appliedDate: "2026-02-03",
      subjects: ["Physics", "Chemistry", "Mathematics"],
      teachingMode: "Offline Only",
      preferredLocations: ["Howrah", "Shibpur", "Santragachi"],
      bio: "Young and energetic teacher with a passion for science education. Focused on conceptual clarity and practical understanding.",
      statusHistory: [
        {
          status: "pending",
          date: "2026-02-03",
          notes: "Application received",
        },
        {
          status: "DC",
          date: "2026-02-05",
          notes: "Demo class completed successfully",
        },
        {
          status: "GC",
          date: "2026-02-07",
          notes: "Guardian call scheduled for Feb 10, 2026",
        },
      ],
    },
  };

  return candidates[candidateId] || null;
};

export default function CandidateDetailPage({
  params,
}: {
  params: Promise<{ id: string; candidateId: string }>;
}) {
  const router = useRouter();
  const { id: postId, candidateId } = React.use(params);
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
    router.push(`/admin/tuitions/${postId}`);
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
      router.push(`/admin/tuitions/${postId}`);
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
      case "DC":
        return "primary";
      case "GC":
        return "secondary";
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
      case "DC":
        return "Demo Class";
      case "GC":
        return "Guardian Call";
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

  // Determine which checkpoints are completed
  const checkpoints = [
    { id: "pending", label: "Application Received", status: "pending" },
    { id: "DC", label: "Demo Class", status: "DC" },
    { id: "GC", label: "Guardian Call", status: "GC" },
    { id: "approved", label: "Approved", status: "approved" },
  ];

  const getCheckpointStatus = (checkpointStatus: string) => {
    const statusOrder = ["pending", "DC", "GC", "approved"];
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
          <div className="flex justify-between gap-3 w-full">
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

          {/* Other Information */}
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

          {/* Additional Details */}
          {/* <div className="space-y-3"> */}
          {/* Subjects */}
          {/* <div>
              <p className="text-sm font-semibold text-default-700 mb-2">
                Subjects
              </p>
              <div className="flex flex-wrap gap-2">
                {candidate.subjects.map((subject: string) => (
                  <Chip key={subject} size="sm" variant="flat" color="primary">
                    {subject}
                  </Chip>
                ))}
              </div>
            </div> */}

          {/* Teaching Mode */}
          {/* <div>
              <p className="text-sm font-semibold text-default-700 mb-2">
                Teaching Mode
              </p>
              <Chip size="sm" variant="flat" color="secondary">
                {candidate.teachingMode}
              </Chip>
            </div> */}

          {/* Preferred Locations */}
          {/* <div>
              <p className="text-sm font-semibold text-default-700 mb-2">
                Preferred Locations
              </p>
              <div className="flex flex-wrap gap-2">
                {candidate.preferredLocations.map((loc: string) => (
                  <Chip key={loc} size="sm" variant="flat">
                    {loc}
                  </Chip>
                ))}
              </div>
            </div> */}

          {/* Bio */}
          {/* {candidate.bio && (
              <div>
                <p className="text-sm font-semibold text-default-700 mb-2">
                  Bio
                </p>
                <p className="text-sm text-default-600">{candidate.bio}</p>
              </div>
            )} */}
          {/* </div> */}
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
            <Radio value="DC">Demo Class (DC)</Radio>
            <Radio value="GC">Guardian Call (GC)</Radio>
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
              removed from this post.
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

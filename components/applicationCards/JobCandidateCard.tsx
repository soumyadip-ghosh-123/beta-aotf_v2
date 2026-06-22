"use client";

import React from "react";
import { Card, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Button } from "@heroui/button";
import { Checkbox } from "@heroui/checkbox";
import { User } from "@heroui/user";
import { Phone, Eye } from "lucide-react";
import { formatPhone } from "@/lib/utils/phone";

export interface JobCandidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  applicantType?: "teacher" | "candidate";
  avatar?: string;
  status: "applied" | "approved" | "decline" | "auto_declined" | "withdrawn";
  appliedDate: string;
  coverLetter?: string;
}

interface JobCandidateCardProps {
  candidate: JobCandidate;
  onViewDetails: (candidate: JobCandidate) => void;
  selectionMode?: boolean;
  isSelected?: boolean;
  onSelectionChange?: (id: string, selected: boolean) => void;
}

export const JobCandidateCard: React.FC<JobCandidateCardProps> = ({
  candidate,
  onViewDetails,
  selectionMode = false,
  isSelected = false,
  onSelectionChange,
}) => {
  const getStatusColor = (
    status: string
  ): "default" | "primary" | "secondary" | "success" | "warning" | "danger" => {
    switch (status) {
      case "applied":
        return "warning";
      case "approved":
        return "success";
      case "decline":
      case "auto_declined":
        return "danger";
      case "withdrawn":
        return "default";
      default:
        return "default";
    }
  };

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case "applied":
        return "Applied";
      case "approved":
        return "Approved";
      case "decline":
        return "Declined";
      case "auto_declined":
        return "Auto Declined";
      case "withdrawn":
        return "Withdrawn";
      default:
        return status;
    }
  };

  const applicantTypeLabel =
    candidate.applicantType === "teacher" ? "Teacher" : "Candidate";

  return (
    <Card
      className={`w-full hover:shadow-md transition-shadow ${isSelected ? "ring-2 ring-danger" : ""}`}
    >
      <CardBody className="p-4">
        <div className="space-y-3">
          {/* Avatar */}
          <div className="flex justify-between gap-3 w-full">
            <div className="flex items-center gap-2">
              {selectionMode && (
                <Checkbox
                  isSelected={isSelected}
                  onValueChange={(val) =>
                    onSelectionChange?.(candidate.id, val)
                  }
                  color="danger"
                  size="sm"
                />
              )}
              <User
                avatarProps={{
                  src: candidate.avatar,
                }}
                name={candidate.name}
                description={`${candidate.email}`}
              />
            </div>
            <Chip
              size="sm"
              color={getStatusColor(candidate.status)}
              variant="flat"
            >
              {getStatusLabel(candidate.status)}
            </Chip>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-sm text-default-600 mb-3">
              <Phone size={14} />
              <span>{formatPhone(candidate.phone)}</span>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-xs text-default-400">
                Applied: {new Date(candidate.appliedDate).toLocaleDateString()}
              </p>
              <Button
                size="sm"
                color="primary"
                variant="flat"
                startContent={<Eye size={16} />}
                onPress={() => onViewDetails(candidate)}
              >
                View Details
              </Button>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default JobCandidateCard;

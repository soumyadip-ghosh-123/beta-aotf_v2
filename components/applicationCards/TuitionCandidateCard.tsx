"use client";

import React from "react";
import { Card, CardBody, CardFooter } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Button } from "@heroui/button";
import { Checkbox } from "@heroui/checkbox";
import { User } from "@heroui/user";
import { Phone, Eye } from "lucide-react";

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  status: "applied" | "DC" | "GC" | "approved" | "decline" | "auto_declined" | "withdrawn";
  appliedDate: string;
  coverLetter?: string;
}

interface CandidateCardProps {
  candidate: Candidate;
  onViewDetails: (candidate: Candidate) => void;
  selectionMode?: boolean;
  isSelected?: boolean;
  onSelectionChange?: (id: string, selected: boolean) => void;
}

export const CandidateCard: React.FC<CandidateCardProps> = ({
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
      case "DC":
        return "primary";
      case "GC":
        return "secondary";
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
      case "DC":
        return "Demo Confirmed";
      case "GC":
        return "Guardian Confirmed";
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

  return (
    <Card className={`w-full hover:shadow-md transition-shadow ${isSelected ? "ring-2 ring-danger" : ""}`}>
      <CardBody className="p-4 pb-2">
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
                description={`Email: ${candidate.email}`}
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
            <div className="flex items-center gap-2 text-sm text-default-600">
              <Phone size={14} />
              <span>{candidate.phone}</span>
            </div>
          </div>
        </div>
      </CardBody>
      <CardFooter className="flex items-center justify-between gap-2 pt-2">
        <p className="text-md font-semibold text-default-400">
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
      </CardFooter>
    </Card>
  );
};

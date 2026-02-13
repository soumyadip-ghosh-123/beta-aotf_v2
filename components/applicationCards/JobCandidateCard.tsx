"use client";

import React from "react";
import { Card, CardBody } from "@heroui/card";
import { Avatar } from "@heroui/avatar";
import { Chip } from "@heroui/chip";
import { Button } from "@heroui/button";
import { User } from "@heroui/user";
import { Phone, MapPin, GraduationCap, Eye, Briefcase } from "lucide-react";

export interface JobCandidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  qualification: string;
  experience: string;
  location: string;
  status: "pending" | "approved" | "declined" | "withdrawn";
  appliedDate: string;
  skills?: string[];
}

interface JobCandidateCardProps {
  candidate: JobCandidate;
  onViewDetails: (candidate: JobCandidate) => void;
}

export const JobCandidateCard: React.FC<JobCandidateCardProps> = ({
  candidate,
  onViewDetails,
}) => {
  const getStatusColor = (
    status: string
  ): "default" | "primary" | "secondary" | "success" | "warning" | "danger" => {
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

  const getStatusLabel = (status: string): string => {
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

  return (
    <Card className="w-full hover:shadow-md transition-shadow">
      <CardBody className="p-4">
        <div className="space-y-3">
          {/* Avatar */}
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

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm mb-3">
              <div className="flex items-center gap-2 text-default-600">
                <Phone size={14} />
                <span>{candidate.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-default-600">
                <GraduationCap size={14} />
                <span>{candidate.qualification}</span>
              </div>
              <div className="flex items-center gap-2 text-default-600">
                <MapPin size={14} />
                <span>{candidate.location}</span>
              </div>
              <div className="flex items-center gap-2 text-default-600">
                <Briefcase size={14} />
                <span>{candidate.experience}</span>
              </div>
            </div>

            {candidate.skills && candidate.skills.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {candidate.skills.slice(0, 3).map((skill) => (
                  <Chip key={skill} size="sm" variant="flat" color="primary">
                    {skill}
                  </Chip>
                ))}
                {candidate.skills.length > 3 && (
                  <Chip size="sm" variant="flat">
                    +{candidate.skills.length - 3} more
                  </Chip>
                )}
              </div>
            )}

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

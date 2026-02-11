"use client";

import React from "react";
import { Card, CardHeader, CardBody, CardFooter } from "@heroui/card";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Divider } from "@heroui/divider";
import {
  User,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  DollarSign,
  Users,
  Share2,
  Eye,
  XCircle,
  Clock,
  Edit,
} from "lucide-react";
import { FaRupeeSign } from "react-icons/fa";

export interface JobPost {
  id: string;
  title: string;
  company: string;
  companyPhone: string;
  designation: string;
  experience: string;
  location: string;
  salary: string;
  jobType: string;
  locationType: string;
  timing: string;
  qualification: string;
  status: "open" | "closed" | "filled";
  type: "job";
  applicantCount: number;
  applicationStats: {
    pending: number;
    approved: number;
    declined: number;
    withdrawn: number;
    total: number;
  };
  postedDate: string;
}

interface JobPostCardProps {
  post: JobPost;
  onShare?: (post: JobPost) => void;
  onCancel?: (post: JobPost) => void;
  onView?: (post: JobPost) => void;
  onEdit?: (post: JobPost) => void;
}

export const JobPostCard: React.FC<JobPostCardProps> = ({
  post,
  onShare,
  onCancel,
  onView,
  onEdit,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "success";
      case "closed":
        return "danger";
      case "filled":
        return "warning";
      default:
        return "default";
    }
  };

  return (
    <Card className="w-full max-w-md hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="flex flex-col gap-3 pb-3">
        <div className="flex justify-between items-start w-full">
          <div className="flex flex-col gap-1 flex-1">
            <div className="flex items-center justify-between gap-2">
              <p className="text-md font-bold text-primary">{post.id}</p>
              <Chip
                size="sm"
                color={getStatusColor(post.status)}
                variant="flat"
                className="capitalize"
              >
                {post.status}
              </Chip>
            </div>
          </div>
        </div>
      </CardHeader>

      <Divider />

      <CardBody className="gap-3 py-4">
        {" "}
        <Button
          isIconOnly
          aria-label="Edit post"
          variant="faded"
          className="absolute top-2 right-2"
          onPress={() => onEdit?.(post)}
        >
          <Edit size={16} />
        </Button>
        {/* Job Details */}
        <div className="space-y-3">
          <div>
            <h3 className="text-lg font-bold text-default-900">
              {post.designation}
            </h3>
            <p className="text-sm text-default-500">{post.company}</p>
          </div>

          <Divider />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="flex items-center gap-2 text-sm">
              <Briefcase size={16} className="text-default-400" />
              <div>
                <span className="text-default-500">Experience:</span>{" "}
                <span className="font-medium text-default-700">
                  {post.experience}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <MapPin size={16} className="text-default-400" />
              <div>
                <span className="text-default-500">Location:</span>{" "}
                <span className="font-medium text-default-700">
                  {post.location}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <FaRupeeSign size={16} className="text-default-400" />
              <div>
                <span className="text-default-500">Salary:</span>{" "}
                <span className="font-medium text-success-600">
                  {post.salary}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock size={16} className="text-default-400" />
              <div>
                <span className="text-default-500">Type:</span>{" "}
                <span className="font-medium text-default-700">
                  {post.jobType}
                </span>
              </div>
            </div>
          </div>

          <Divider />

          <div className="grid grid-cols-1 gap-2">
            <div className="flex items-start gap-2 text-sm">
              <Calendar size={16} className="text-default-400 mt-0.5" />
              <div>
                <span className="text-default-500">Timing:</span>{" "}
                <span className="font-medium text-default-700">
                  {post.timing}
                </span>
              </div>
            </div>
            <div className="flex items-start gap-2 text-sm">
              <Briefcase size={16} className="text-default-400 mt-0.5" />
              <div>
                <span className="text-default-500">Qualification:</span>{" "}
                <span className="font-medium text-default-700">
                  {post.qualification}
                </span>
              </div>
            </div>
          </div>

          <Divider />

          {/* Company Contact */}
          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold text-default-700">
              Company Contact
            </p>
            <div className="flex items-center gap-2 text-sm pl-2">
              <Phone size={16} className="text-default-400" />
              <span className="text-default-600">{post.companyPhone}</span>
            </div>
          </div>

          <Divider />

          {/* Application Statistics */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-default-700">
                  Applications
                </span>
              </div>
              <Chip size="sm" color="primary" variant="flat">
                {post.applicantCount} Total
              </Chip>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="flex flex-col items-center p-2 bg-warning-50 rounded-lg">
                <p className="text-xs text-warning-600">Pending</p>
                <p className="text-lg font-bold text-warning-700">
                  {post.applicationStats.pending}
                </p>
              </div>
              <div className="flex flex-col items-center p-2 bg-success-50 rounded-lg">
                <p className="text-xs text-success-600">Approved</p>
                <p className="text-lg font-bold text-success-700">
                  {post.applicationStats.approved}
                </p>
              </div>
              <div className="flex flex-col items-center p-2 bg-danger-50 rounded-lg">
                <p className="text-xs text-danger-600">Declined</p>
                <p className="text-lg font-bold text-danger-700">
                  {post.applicationStats.declined}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardBody>

      <Divider />

      <CardFooter className="gap-2 py-3">
        <Button
          size="sm"
          color="primary"
          variant="solid"
          startContent={<Share2 size={16} />}
          onPress={() => onShare?.(post)}
          className="flex-1"
        >
          Share
        </Button>
        <Button
          size="sm"
          color="danger"
          variant="solid"
          startContent={<XCircle size={16} />}
          onPress={() => onCancel?.(post)}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          size="sm"
          color="success"
          variant="solid"
          startContent={<Eye size={16} />}
          onPress={() => onView?.(post)}
          className="flex-1"
        >
          View
        </Button>
      </CardFooter>
    </Card>
  );
};

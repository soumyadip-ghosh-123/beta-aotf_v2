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
  BookOpen,
  Calendar,
  DollarSign,
  Users,
  Share2,
  Eye,
  XCircle,
  CheckCircle,
  Clock,
  Edit,
} from "lucide-react";
import { FaRupeeSign } from "react-icons/fa";

export interface TuitionPost {
  id: string;
  title: string;
  subtitle: string;
  guardian: string;
  guardianPhone: string;
  className: string;
  subject: string;
  board: string;
  location: string;
  budget: number;
  classType: string;
  frequency: string;
  preferredDays: string[];
  notes: string;
  status: "open" | "closed" | "filled";
  type: "post";
  applicantCount: number;
  applicationStats: {
    pending: number;
    DC: number;
    GC: number;
    approved: number;
    declined: number;
    withdrawn: number;
    total: number;
  };
}

interface TuitionPostCardProps {
  post: TuitionPost;
  onShare?: (post: TuitionPost) => void;
  onCancel?: (post: TuitionPost) => void;
  onView?: (post: TuitionPost) => void;
  onEdit?: (post: TuitionPost) => void;
}

export const TuitionPostCard: React.FC<TuitionPostCardProps> = ({
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

  const getClassTypeLabel = (type: string) => {
    switch (type) {
      case "in-person":
        return "In-Person";
      case "online":
        return "Online";
      case "hybrid":
        return "Hybrid";
      default:
        return type;
    }
  };

  const getFrequencyLabel = (freq: string) => {
    const map: Record<string, string> = {
      one: "1 day/week",
      two: "2 days/week",
      three: "3 days/week",
      four: "4 days/week",
      five: "5 days/week",
      six: "6 days/week",
      daily: "Daily",
    };
    return map[freq] || freq;
  };

  return (
    <Card className="w-full max-w-md hover:shadow-lg transition-shadow duration-300 ">
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

      <CardBody className="gap-1 py-1">        <Button
          isIconOnly
          aria-label="Take a photo"
          variant="faded"
          className="absolute top-2 right-2"
          onPress={() => onEdit?.(post)}
        >
          <Edit size={16} />
        </Button>
        {/* Academic Details */}
        <p className="text-sm font-semibold text-default-700">
          Academic Details
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-1 pl-2">
          <div className="flex items-center gap-2 text-sm">
            <BookOpen size={16} className="text-default-400" />
            <div>
              <span className="text-default-500">Class:</span>{" "}
              <span className="font-medium text-default-700">
                {post.className}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle size={16} className="text-default-400" />
            <div>
              <span className="text-default-500">Board:</span>{" "}
              <span className="font-medium text-default-700">{post.board}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <BookOpen size={16} className="text-default-400" />
            <div>
              <span className="text-default-500">Subject:</span>{" "}
              <span className="font-medium text-default-700">
                {post.subject}
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
        </div>

        <Divider />

        {/* Schedule & Budget */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-1 pl-2">
          <div className="flex items-center gap-2 text-sm">
            <Clock size={16} className="text-default-400" />
            <div>
              <span className="text-default-500">Class Type:</span>{" "}
              <span className="font-medium text-default-700">
                {getClassTypeLabel(post.classType)}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar size={16} className="text-default-400" />
            <div>
              <span className="text-default-500">Frequency:</span>{" "}
              <span className="font-medium text-default-700">
                {getFrequencyLabel(post.frequency)}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <FaRupeeSign size={16} className="text-default-400" />
            <div>
              <span className="text-default-500">Monthly Fees:</span>{" "}
              <span className="font-medium text-success-600">
                ₹{post.budget}
              </span>
            </div>
          </div>
        </div>

        {/* Preferred Days */}
        {post.preferredDays && post.preferredDays.length > 0 && (
          <>
            <Divider />
            <div className="flex flex-row gap-2">
              <p className="text-sm text-default-500">Preferred Days:</p>
              <div className="flex flex-wrap gap-2">
                {post.preferredDays.map((day) => (
                  <Chip key={day} size="sm" variant="flat" color="primary">
                    {day}
                  </Chip>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Notes */}
        {post.notes && (
          <>
            <Divider />
            <div className="flex flex-col gap-2">
              <p className="text-sm text-default-500">Additional Notes:</p>
              <p className="text-sm text-default-700 pl-2">{post.notes}</p>
            </div>
          </>
        )}

        <Divider />

        {/* Guardian Information */}
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold text-default-700">
            Guardian Details
          </p>
          <div className="flex flex-col gap-2 pl-2">
            <div className="flex items-center gap-2 text-sm">
              <User size={16} className="text-default-400" />
              <span className="text-default-600">{post.guardian}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Phone size={16} className="text-default-400" />
              <span className="text-default-600">{post.guardianPhone}</span>
            </div>
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

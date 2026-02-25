"use client";

import { Card, CardHeader, CardBody, CardFooter } from "@heroui/card";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { User } from "@heroui/user";
import { useState } from "react";
import { FaMapMarkerAlt, FaArrowRight, FaShare, FaEye } from "react-icons/fa";
import { BsCurrencyRupee } from "react-icons/bs";
import { FaClock } from "react-icons/fa6";
import { MdDoneAll } from "react-icons/md";
import { useRouter } from "next/navigation";

interface JobPostProps {
  jobId: string;
  clientName: string;
  phoneNumber: string;
  companyType: "individual" | "company";
  title: string;
  workType: "job" | "project";
  experience?: string;
  locationType: "remote" | "onsite" | "hybrid";
  location: string;
  gender: "male" | "female" | "both" | "all";
  timing: string;
  salary?: string;
  requiredQualification?: string;
  projectType?: "one-time" | "ongoing";
  budget?: string;
  duration?: string;
  brief?: string;
  status: "open" | "closed" | "hold" | "cancelled";
  createdAt?: string;
}

/* ---------- FORMATTERS ---------- */

const formatLocationType = (type: string) =>
  ({ remote: "Remote", onsite: "On-Site", hybrid: "Hybrid" })[type] ?? type;

const formatStatus = (status: string) =>
  ({
    open: "Open",
    closed: "Closed",
    hold: "Hold",
    cancelled: "Cancelled",
  })[status] ?? status;

const statusColor = (status: string): "success" | "default" | "warning" | "danger" =>
  ({
    open: "success" as const,
    closed: "default" as const,
    hold: "warning" as const,
    cancelled: "danger" as const,
  })[status] ?? "default";

const formatWorkType = (type: string) =>
  ({ job: "Job", project: "Project" })[type] ?? type;

const formatCompanyType = (type: string) =>
  ({ individual: "Individual", company: "Company" })[type] ?? type;

/* ---------- COMPONENT ---------- */

const JobPost = ({
  jobId,
  clientName,
  companyType,
  title,
  workType,
  experience,
  locationType,
  location,
  timing,
  salary,
  requiredQualification,
  budget,
  duration,
  status,
}: JobPostProps) => {
  const [isApplied, setIsApplied] = useState(false);
  const router = useRouter();

  const chips = [
    formatWorkType(workType),
    experience,
    formatLocationType(locationType),
  ].filter(Boolean);

  return (
    <Card className="max-w-lg w-full mx-auto">
      {/* HEADER */}
      <CardHeader className="justify-between">
        <User
          name={clientName}
          description={formatCompanyType(companyType)}
        />
        <Chip radius="sm" size="sm" color={statusColor(status)}>
          {formatStatus(status)}
        </Chip>
      </CardHeader>

      {/* BODY */}
      <CardBody className="px-3 py-0 text-small text-default-500">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-3 leading-snug">
          {title}
        </h1>

        {/* Chips */}
        <div className="flex gap-2 flex-wrap">
          {chips.map((chip) => (
            <Chip
              key={chip}
              radius="sm"
              variant="shadow"
              size="sm"
              className="bg-default-100 text-sm font-medium"
            >
              {chip}
            </Chip>
          ))}
        </div>

        {/* Location */}
        <div className="flex items-center gap-3 my-2">
          <div className="shrink-0 w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-primary flex items-center justify-center transition-colors group-hover:bg-primary group-hover:text-white">
            <FaMapMarkerAlt size={20} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Location
            </p>
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100 leading-snug">
              {location}
            </p>
          </div>
        </div>

        {/* Salary or Budget */}
        {(workType === "job" ? salary : budget) && (
          <div className="flex items-center gap-3 my-2">
            <div className="shrink-0 w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-primary flex items-center justify-center transition-colors group-hover:bg-primary group-hover:text-white">
              <BsCurrencyRupee size={20} />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                {workType === "job" ? "Salary" : "Budget"}
              </p>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100 leading-snug">
                {workType === "job" ? salary : budget}
                {workType === "project" && duration && ` (${duration})`}
              </p>
            </div>
          </div>
        )}

        {/* Timing */}
        <div className="flex items-center gap-3 my-2">
          <div className="shrink-0 w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-primary flex items-center justify-center transition-colors group-hover:bg-primary group-hover:text-white">
            <FaClock size={20} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Working Hours
            </p>
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100 leading-snug">
              {timing}
            </p>
          </div>
        </div>

        {/* Qualification */}
        {requiredQualification && (
          <div className="mt-3 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg">
            <p className="text-xs font-bold uppercase text-amber-700 mb-1">
              Required Qualification
            </p>
            <p className="text-sm">{requiredQualification}</p>
          </div>
        )}
      </CardBody>

      {/* FOOTER */}
      <CardFooter>
        <div className="grid grid-cols-3 gap-2 w-full">
          <Button
            size="sm"
            className="bg-default-200"
            onClick={() => router.push(`/posts/${jobId}`)}
          >
            View
            <FaEye />
          </Button>

          <Button size="sm" color="secondary">
            Share <FaShare />
          </Button>

          <Button
            size="sm"
            color={isApplied ? "default" : "primary"}
            isDisabled={isApplied}
            onClick={() => setIsApplied(true)}
          >
            {isApplied ? "Applied" : "Apply"}
            {isApplied ? <MdDoneAll /> : <FaArrowRight />}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default JobPost;

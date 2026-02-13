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
  companyName: string;
  phoneNumber: string;
  companyType: string;
  designation: string;
  experience: string;
  locationType: 1 | 2 | 3;
  location: string;
  gender?: 1 | 2 | 3;
  timing: string;
  salary: string;
  requiredQualification: string;
  status: 1 | 2;
  jobType: 1 | 2 | 3;
  createdAt?: Date;
}

/* ---------- FORMATTERS ---------- */

const formatLocationType = (type?: number) =>
  ({ 1: "On-Site", 2: "Remote", 3: "Hybrid" })[type ?? 0] ?? "";

const formatStatus = (type: number) => ({ 1: "Open", 2: "Closed" })[type] ?? "";

const formatJobType = (type: number) =>
  ({ 1: "Full-Time", 2: "Part-Time", 3: "Contract" })[type] ?? "";

/* ---------- COMPONENT ---------- */

const JobPost = ({
  jobId,
  companyName,
  companyType,
  designation,
  experience,
  locationType,
  location,
  timing,
  salary,
  requiredQualification,
  status,
  jobType,
}: JobPostProps) => {
  const [isApplied, setIsApplied] = useState(false);

  const chips = [
    formatJobType(jobType),
    experience,
    formatLocationType(locationType),
  ].filter(Boolean);
  const router = useRouter();
  return (
    <Card className="max-w-lg w-full mx-auto">
      {/* HEADER */}
      <CardHeader className="justify-between">
        <User name={companyName} description={`${companyType}`} />
        <Chip
          radius="sm"
          size="sm"
          color={status === 1 ? "success" : "default"}
        >
          {formatStatus(status)}
        </Chip>
      </CardHeader>

      {/* BODY */}
      <CardBody className="px-3 py-0 text-small text-default-500">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-3 leading-snug">
          {designation}
        </h1>

        {/* Chips */}
        <div className="flex gap-2 flex-wrap">
          {chips.map((chip, i) => (
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

        {/* Salary */}
        <div className="flex items-center gap-3 my-2">
          <div className="shrink-0 w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-primary flex items-center justify-center transition-colors group-hover:bg-primary group-hover:text-white">
            <BsCurrencyRupee size={20} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Salary
            </p>
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100 leading-snug">
              {salary}
            </p>
          </div>
        </div>

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
        <div className="mt-3 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg">
          <p className="text-xs font-bold uppercase text-amber-700 mb-1">
            Required Qualification
          </p>
          <p className="text-sm">{requiredQualification}</p>
        </div>
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

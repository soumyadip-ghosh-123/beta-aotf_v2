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
    <Card className="max-w-md w-full mx-auto pt-3 mb-4">
      {/* HEADER */}
      <CardHeader className="justify-between">
        <User
          name={companyName}
          description={`${companyType} • ${designation}`}
        />
        <Chip radius="sm" color={status === 1 ? "success" : "default"}>
          {formatStatus(status)}
        </Chip>
      </CardHeader>

      {/* BODY */}
      <CardBody className="px-3 text-small text-default-500">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
          {designation}
        </h1>

        {/* Chips */}
        <div className="flex gap-2 mb-3 flex-wrap">
          {chips.map((chip, i) => (
            <Chip key={i} radius="sm" variant="faded">
              {chip}
            </Chip>
          ))}
        </div>

        {/* Location */}
        <div className="flex gap-3 my-2">
          <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <FaMapMarkerAlt />
          </div>
          <div>
            <p className="text-xs text-default-400 uppercase">Location</p>
            <p className="text-sm font-medium">{location}</p>
          </div>
        </div>

        {/* Salary */}
        <div className="flex gap-3 my-2">
          <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <BsCurrencyRupee />
          </div>
          <div>
            <p className="text-xs text-default-400 uppercase">Salary</p>
            <p className="text-sm font-medium">{salary}</p>
          </div>
        </div>

        {/* Timing */}
        <div className="flex gap-3 my-2">
          <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <FaClock />
          </div>
          <div>
            <p className="text-xs text-default-400 uppercase">Working Hours</p>
            <p className="text-sm font-medium">{timing}</p>
          </div>
        </div>

        {/* Qualification */}
        <div className="mt-3 bg-amber-50 dark:bg-amber-900/20 border p-3 rounded-lg">
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
            View Details
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

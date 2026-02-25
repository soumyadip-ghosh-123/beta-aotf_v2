"use client";
import { User } from "@heroui/user";
import { Card, CardHeader, CardBody, CardFooter } from "@heroui/card";
import { Button } from "@heroui/button";
import { useState } from "react";
import { Chip } from "@heroui/chip";
import { FaMapMarkerAlt, FaShare } from "react-icons/fa";
import { BsCurrencyRupee } from "react-icons/bs";
import { LuNotebookText } from "react-icons/lu";
import { FaArrowRight } from "react-icons/fa";
import { FaEye } from "react-icons/fa";
import { MdDoneAll } from "react-icons/md";
import { SlCalender } from "react-icons/sl";
import { FaBookOpen } from "react-icons/fa";
import { useRouter } from "next/navigation";

export interface StudentProp {
  className: string;
  board: string;
  subjects: string[];
  subjectsNormalized?: string[];
}

interface TuitionPostProps {
  postId: string;
  enquiryId?: string;
  guardianName?: string;
  guardianPhone?: string;
  students: StudentProp[];
  preferredTime?: string;
  preferredDays?: string[];
  frequencyPerWeek: number;
  classType: "online" | "offline" | "both";
  location?: string;
  monthlyBudget?: number;
  notes?: string;
  status: "open" | "matched" | "closed" | "cancelled" | "hold";
  createdAt: Date;
  updatedAt: Date;
  applicants?: string[];
  createdByUserId?: { name?: string; avatar?: string };
}

const getFrequencyText = (freq: number): string => {
  if (freq === 7) return "Daily";
  return `${freq} day${freq !== 1 ? "s" : ""} /Week`;
};

const getClassTypeText = (type: string): string => {
  const types: Record<string, string> = {
    offline: "In-Person",
    online: "Online",
    both: "Both",
  };
  return types[type] || type;
};

const getTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
  if (diffHours > 0)
    return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
  if (diffMins > 0) return `${diffMins} min${diffMins !== 1 ? "s" : ""} ago`;
  return "Just now";
};

const TuitionPost = ({
  postId,
  enquiryId,
  guardianName,
  guardianPhone,
  students,
  preferredTime,
  preferredDays,
  frequencyPerWeek,
  classType,
  location,
  monthlyBudget,
  notes,
  status,
  createdAt,
  updatedAt,
  applicants = [],
  createdByUserId = {},
}: TuitionPostProps) => {
  const [isApplied, setIsApplied] = useState(false);

  // Derive display values from students array (defensive fallback)
  const safeStudents = students ?? [];
  const allSubjects = safeStudents.flatMap((s) => s.subjects);
  const subjectDisplay = allSubjects.join(", ") || "N/A";
  const classDisplay = safeStudents.map((s) => s.className).join(", ");
  const boardDisplay = safeStudents.map((s) => s.board).join(", ");

  const chips = [
    `Class - ${classDisplay}`,
    `Board - ${boardDisplay}`,
  ].filter(Boolean);
  const router = useRouter();
  return (
    <Card className="max-w-lg w-full mx-auto">
      <CardHeader className="justify-between">
        <User
          avatarProps={{
            src: `${createdByUserId.avatar || ""}`,
            alt: "Creator Avatar",
          }}
          description={`Posted ${getTimeAgo(createdAt)}`}
          name={createdByUserId.name || "Admin"}
        />
        <Chip radius="sm" size="sm" className="bg-default-200">
          {applicants.length} Applicant{applicants.length !== 1 ? "s" : ""}
        </Chip>
      </CardHeader>
      <CardBody className="px-3 py-0 text-small text-default-400">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-3 leading-snug">
          {subjectDisplay}
        </h1>
        {/* 3 chips with map function */}
        <div className="flex gap-2">
          {chips.map((chip) => (
            <Chip
              key={chip}
              size="sm"
              radius="sm"
              variant="shadow"
              className="bg-default-100 text-sm font-medium"
            >
              {chip}
            </Chip>
          ))}
        </div>

        {location && (
          <div className="flex items-center gap-3 group my-2">
            <div className="shrink-0 w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-primary flex items-center justify-center transition-colors group-hover:bg-primary group-hover:text-white">
              <FaMapMarkerAlt size={20} />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Location
              </span>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100 leading-snug">
                {location}
              </p>
            </div>
          </div>
        )}
        {monthlyBudget && (
          <div className="flex items-center gap-3 group my-2">
            <div className="shrink-0 w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-primary flex items-center justify-center transition-colors group-hover:bg-primary group-hover:text-white">
              <BsCurrencyRupee size={20} />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Monthly Budget
              </span>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100 leading-snug">
                ₹ {monthlyBudget.toLocaleString()}/month
              </p>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <Card className="w-full p-3 h-fit">
            <CardHeader className="p-0 mb-2 z-0">
              <SlCalender
                size={20}
                className="text-primary inline-block mr-2"
              />
              <h3 className="text-md font-bold">Frequency</h3>
            </CardHeader>
            <p className="text-sm">{getFrequencyText(frequencyPerWeek)}</p>
          </Card>
          <Card className="w-full p-3 h-fit">
            <CardHeader className="p-0 mb-2 z-0">
              <FaBookOpen
                size={20}
                className="text-primary inline-block mr-2"
              />
              <h3 className="text-md font-bold">Class Type</h3>
            </CardHeader>
            <p className="text-sm">{getClassTypeText(classType)}</p>
          </Card>
        </div>
        {notes && (
          <div className="mt-2 mb-4">
            <div className="flex gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/30 p-2 rounded-lg">
              <LuNotebookText
                size={24}
                className="text-amber-600 dark:text-amber-400"
              />
              <div className="flex flex-col justify-center">
                <p className="text-xs font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wide mb-0.5">
                  Notes
                </p>
                <p className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed font-medium">
                  {notes}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardBody>
      {/* <Divider /> */}
      <CardFooter className="gap-3">
        <div className="grid grid-cols-3 gap-2 justify-between w-full">
          <Button
            size="sm"
            className="bg-default-200"
            onClick={() => router.push(`/posts/${postId}`)}
          >
            View
            <FaEye />
          </Button>
          <Button size="sm" color="secondary">
            Share
            <FaShare />
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

export default TuitionPost;

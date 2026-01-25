"use client";
import { User } from "@heroui/user";
import { Card, CardHeader, CardBody, CardFooter } from "@heroui/card";
import { Button } from "@heroui/button";
import { useState } from "react";
import { Chip } from "@heroui/chip";
import { FaMapMarkerAlt } from "react-icons/fa";
import { BsCurrencyRupee } from "react-icons/bs";
import { LuNotebookText } from "react-icons/lu";
import { FaArrowRight } from "react-icons/fa";
import { FaEye } from "react-icons/fa";
import { MdDoneAll } from "react-icons/md";
import { FaShareFromSquare } from "react-icons/fa6";
import { SlCalender } from "react-icons/sl";
import { FaBookOpen } from "react-icons/fa";
import { useRouter } from "next/navigation";

interface TuitionPostProps {
  postId: string;
  enquiryId?: string[];
  guardianName?: string;
  guardianPhone?: string;
  subject: string;
  className: string;
  board?: 1 | 2 | 3 | 4 | 5 | 6;
  preferredTime?: string;
  preferredDays?: string[];
  frequencyPerWeek: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  classType: 1 | 2 | 3;
  location?: string;
  monthlyBudget?: number;
  notes?: string;
  status: 1 | 2 | 3 | 4;
  createdAt: Date;
  updatedAt: Date;
  applicants: string[];
  createdByUserId: { name?: string; avatar?: string };
  editedAt?: Date;
  editedByUserId?: string;
  editedByName?: string;
}

// map numeric values to strings
const getBoardName = (board?: number): string => {
  const boards: Record<number, string> = {
    1: "CBSE",
    2: "ICSE",
    3: "ISC",
    4: "IB",
    5: "WB-Bengali version",
    6: "WB-English Version",
  };
  return board ? boards[board] || "" : "";
};

const getFrequencyText = (freq: number): string => {
  const frequencies: Record<number, string> = {
    1: "Once/Week",
    2: "Twice/Week",
    3: "Thrice/Week",
    4: "4 times/Week",
    5: "5 times/Week",
    6: "6 times/Week",
    7: "Daily",
  };
  return frequencies[freq] || "";
};

const getClassTypeText = (type: number): string => {
  const types: Record<number, string> = {
    1: "In-Person",
    2: "Online",
    3: "Both",
  };
  return types[type] || "";
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
  subject,
  className,
  board,
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
  applicants,
  createdByUserId,
  editedAt,
  editedByUserId,
  editedByName,
}: TuitionPostProps) => {
  const [isApplied, setIsApplied] = useState(false);

  const boardName = getBoardName(board);
  const chips = [className, boardName, subject].filter(Boolean);
  const router = useRouter();
  return (
    <Card className="max-w-115 w-full mx-auto pt-3 mb-4">
      <CardHeader className="justify-between z-0">
        <User
          avatarProps={{
            src: `${createdByUserId.avatar || ""}`,
            alt: "Creator Avatar",
          }}
          description={`Admin • Posted ${getTimeAgo(createdAt)}`}
          name={createdByUserId.name || "Admin"}
        />
        <Chip radius="sm" className="bg-default-200">
          {applicants.length} Applicant{applicants.length !== 1 ? "s" : ""}
        </Chip>
      </CardHeader>
      <CardBody className="px-3 py-0 text-small text-default-400">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-3 leading-snug">
          {subject} Tuition Needed
        </h1>
        {/* 3 chips with map function */}
        <div className="flex gap-2">
          {chips.map((chip) => (
            <Chip
              key={chip}
              radius="sm"
              variant="faded"
              size="sm"
              className="bg-default-100"
            >
              {chip}
            </Chip>
          ))}
        </div>

        {location && (
          <div className="flex items-start gap-3 group my-2">
            <div className="shrink-0 w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-primary flex items-center justify-center transition-colors group-hover:bg-primary group-hover:text-white">
              <FaMapMarkerAlt size={20} />
            </div>
            <div className="flex flex-col pt-0.5">
              <span className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-0.5">
                Location
              </span>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100 leading-snug">
                {location}
              </p>
            </div>
          </div>
        )}
        {monthlyBudget && (
          <div className="flex items-start gap-3 group my-2">
            <div className="shrink-0 w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-primary flex items-center justify-center transition-colors group-hover:bg-primary group-hover:text-white">
              <BsCurrencyRupee size={20} />
            </div>
            <div className="flex flex-col pt-0.5">
              <span className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-0.5">
                Monthly Budget
              </span>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100 leading-snug">
                ₹{monthlyBudget.toLocaleString()}/month
              </p>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <Card className="w-full p-3 h-fit">
            <CardHeader className="p-0 mb-2">
              <SlCalender
                size={20}
                className="text-primary inline-block mr-2"
              />
              <h3 className="text-md font-bold">Frequency</h3>
            </CardHeader>
            <p className="text-sm">{getFrequencyText(frequencyPerWeek)}</p>
          </Card>
          <Card className="w-full p-3 h-fit">
            <CardHeader className="p-0 mb-2">
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
            View Details
            <FaEye />
          </Button>
          <Button size="sm" color="secondary" variant="bordered">
            Share
            <FaShareFromSquare />
          </Button>
          <Button
            size="sm"
            color={isApplied ? "default" : "primary"}
            isDisabled={isApplied}
            onClick={() => setIsApplied(true)}
          >
            {isApplied ? "Applied" : "Apply Now"}
            {isApplied ? <MdDoneAll /> : <FaArrowRight />}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default TuitionPost;

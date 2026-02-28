"use client";

import BackButton from "@/components/BackButton";
import { Tab, Tabs } from "@heroui/tabs";
import { LuNotebookPen } from "react-icons/lu";
import { PiBagSimpleDuotone } from "react-icons/pi";
import TuitionPost from "@/components/PostCards/TuitionPost";
import JobPost from "@/components/PostCards/JobPost";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@heroui/dropdown";
import { Button } from "@heroui/button";
import { Filter } from "lucide-react";

const page = () => {
  const isTeacher = true;
  const isCandidate = true; // Replace with actual logic to determine if user is a candidate
  const Mockdata = {
    postId: "P-25112500",
    enquiryId: "E-25112501",
    guardianName: "Rajesh Sharma",
    guardianPhone: "9876543210",
    students: [
      {
        className: "8",
        board: "ICSE",
        subjects: ["Mathematics", "Science"],
        subjectsNormalized: ["mathematics", "science"],
      },
      {
        className: "5",
        board: "CBSE",
        subjects: ["English"],
        subjectsNormalized: ["english"],
      },
    ],
    preferredTime: "6:00 PM - 7:30 PM",
    preferredDays: ["Mon", "Wed", "Fri"],
    frequencyPerWeek: 3,
    classType: "offline" as const,
    location: "Dhakuria near Metro Station, Kolkata",
    monthlyBudget: 3000,
    notes: "Only Female Teacher Required. Must have prior experience.",
    status: "open" as const,
    createdAt: new Date("2025-11-25T06:10:16.434Z"),
    updatedAt: new Date("2025-11-25T10:55:23.704Z"),
    applicants: ["69254be157f77cfb98de0d6e", "69258aa32ef2dd07ebaae681"],
    createdByUserId: {
      name: "Soumyadip",
      avatar: "",
    },
  };
  const jobPostData = {
    jobId: "J-08122500",
    clientName: "Google LLC",
    phoneNumber: "8697159284",
    companyType: "company" as const,
    title: "HR for Payroll, PF & ESIC",
    workType: "job" as const,
    experience: "Minimum 5 Years",
    locationType: "onsite" as const,
    location: "Chandni Metro Station, Kolkata",
    gender: "all" as const,
    status: "open" as const,
    timing: "10:00 AM - 7:00 PM",
    salary: "₹70,000 CTC + PF",
    requiredQualification: "Degree in HR / Finance or related field",
    createdAt: new Date().toISOString(),
  };
  return (
    <div className="w-full">
      <BackButton title="Dashboard" />

      {/* Show Tabs ONLY if user is a Candidate */}
      <div className="w-full flex flex-col items-center justify-center">
        <Tabs
          aria-label="Options"
          color="primary"
          variant="solid"
          className="sticky top-18 z-20"
          radius="full"
        >
          <Tab
            key="tuition"
            title={
              <div className="w-full flex items-center space-x-2">
                <LuNotebookPen size={20} />
                <span>Tuition</span>
              </div>
            }
            className="w-full max-w-md"
          >
            <div className="space-y-3">
              {[...Array(5)].map((_, index) => (
                <TuitionPost key={index} {...Mockdata} />
              ))}
            </div>
          </Tab>

          {/* Always show Jobs tab for any Candidate */}
          <Tab
            key="jobs"
            title={
              <div className="w-full flex items-center space-x-2">
                <PiBagSimpleDuotone size={20} />
                <span>Jobs</span>
              </div>
            }
            className="w-full max-w-md"
          >
            <div className="space-y-3">
              {[...Array(7)].map((_, index) => (
                <JobPost key={index} {...jobPostData} />
              ))}
            </div>
          </Tab>
        </Tabs>
      </div>
    </div>
  );
};

export default page;

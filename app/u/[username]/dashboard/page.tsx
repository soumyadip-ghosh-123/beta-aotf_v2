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
    subject: "Science",
    className: "8",
    board: 2 as const, // ICSE = 2
    preferredTime: "6 PM",
    preferredDays: ["Mon", "Wed", "Fri"],
    frequencyPerWeek: 2 as const, // twice = 2
    classType: 1 as const, // in-person = 1
    location: "Dhakuria near Metro Station",
    monthlyBudget: 2000,
    notes: "Only Female Teacher Required",
    status: 1 as const, // open = 1
    applicants: ["69254be157f77cfb98de0d6e", "69258aa32ef2dd07ebaae681"],
    createdAt: new Date("2025-11-25T06:10:16.434Z"),
    updatedAt: new Date("2025-11-25T10:55:23.704Z"),
    createdByUserId: { name: "Soumyadip", avatar: "" },
  };
  const jobPostData = {
    jobId: "JOB-081225001",
    companyName: "Google LLC",
    phoneNumber: "8697159284",
    companyType: "Steel Industries",
    designation: "HR for Payroll, PF & ESIC",
    experience: "Minimum 5 Years",

    locationType: 1, // ✅ literal preserved
    location: "Chandni Metro Station, Kolkata",
    gender: 1,
    status: 1,
    jobType: 1,

    timing: "10:00 AM - 7:00 PM",
    salary: "₹70,000 CTC + PF",
    requiredQualification: "Degree in HR / Finance or related field",
    createdAt: new Date(),
  } as const;
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
          >
            {[...Array(5)].map((_, index) => (
              <TuitionPost key={index} {...Mockdata} />
            ))}
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
          >
            {[...Array(7)].map((_, index) => (
              <JobPost key={index} {...jobPostData} />
            ))}
          </Tab>
        </Tabs>
      </div>
    </div>
  );
};

export default page;

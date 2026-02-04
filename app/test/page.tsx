"use client";
import Search from "@/components/Search";
import TuitionPost from "@/components/PostCards/TuitionPost";
import ClickSpark from "@/components/reactbits/ui/ClickSpark";
import ImageSlider from "@/components/ImageSlider";
import { TimelineDemo } from "@/components/aceternity/TimelineDemo";
import TextType from "@/components/reactbits/ui/TextType";
import Onboarding from "@/components/reactbits/Onboarding";
import { FaBook } from "react-icons/fa";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { IdCard } from "@/components/aceternity/IdCard";
import Carousel from "@/components/reactbits/ui/Carousel";
import { Archive, Home } from "lucide-react";
import { MdAccountBalance, MdSettings } from "react-icons/md";
import { ArcNavigation } from "@/components/arc-navigation";
import JobPost from "@/components/PostCards/JobPost";
import EnquiryForm from "@/components/enquiry/EnquiryForm";
export default function PricingPage() {
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

    timing: "10:00 AM – 7:00 PM",
    salary: "₹70,000 CTC + PF",
    requiredQualification: "Degree in HR / Finance or related field",
    createdAt: new Date(),
  } as const;

  const tuitionPostData = {
    postId: "TUITION-081225001",
    subject: "Mathematics",
    className: "10th Grade",
    board: 1,
    frequencyPerWeek: 3,
    classType: 2,
    status: 1,
    createdAt: new Date(),
    guardianName: "Anita Sharma",
    guardianPhone: "9876543210",
    preferredTime: "4:00 PM - 6:00 PM",
    preferredDays: ["Monday", "Wednesday", "Friday"],
    location: "Salt Lake City, Kolkata",
    monthlyBudget: 5000,
    notes: "Looking for an experienced tutor to help with exam preparation.",
    applicants: [],
    createdByUserId: { name: "Anita Sharma", avatar: "" },
    updatedAt: new Date(),
  } as const;

  return (
    <div className="w-full flex flex-col items-center justify-center gap-4">
      <EnquiryForm />
      {/* <TuitionPost {...tuitionPostData} /> */}
    </div>
  );
}

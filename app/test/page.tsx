"use client";
import JobPostForm from "@/components/admin/postforms/jobPostForm";
import TuitionPostForm from "@/components/admin/postforms/tuitionPostForm";
import BackButton from "@/components/BackButton";
import EnquiryForm from "@/components/enquiry/EnquiryForm";
import LottiePlayer from "@/components/LottiePlayer";
import Dock from "@/components/reactbits/ui/Dock";
import { BriefcaseBusiness, GraduationCap, HomeIcon, User } from "lucide-react";
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
    <div className="w-full h-100 flex flex-col items-center justify-center gap-4">
      <BackButton title="Test Page" />
      <h1 className="text-2xl font-bold">This is a test page for components</h1>
      <div className="w-full max-w-3xl">
        <h2 className="text-xl font-semibold mb-2">Job Post Form</h2>
      </div>
    </div>
  );
}

"use client";
import TuitionPostForm from "@/components/admin/postform/tuitionPostForm";
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
      <TuitionPostForm />
    </div>
  );
}

import Search from "@/components/Search";
import TuitionPost from "@/components/TuitionPost";

export default function PricingPage() {
  const data = {
    postId: "P-25112500",
    userId: "691c292a4711f0e693f09043",
    name: "Soumyadip",
    email: "soumyadip.superadmin@aotf.in",
    subject: "Science",
    className: "8",
    board: "ICSE",
    preferredTime: "6 PM",
    preferredDays: ["Mon", "Wed", "Fri"],
    frequencyPerWeek: "twice",
    classType: "in-person",
    location: "Dhakuria near Metro Station",
    monthlyBudget: 2000,
    notes: "Only Female Teacher Required",
    status: "open",
    applicants: [
      {
        $oid: "69254be157f77cfb98de0d6e",
      },
      {
        $oid: "69258aa32ef2dd07ebaae681",
      },
    ],
    createdAt: {
      $date: "2025-11-25T06:10:16.434Z",
    },
    updatedAt: {
      $date: "2025-11-25T10:55:23.704Z",
    }
  };
  return (
    <div className="w-full flex flex-col items-center justify-center gap-4">
      <Search />
      <TuitionPost />
    </div>
  );
}

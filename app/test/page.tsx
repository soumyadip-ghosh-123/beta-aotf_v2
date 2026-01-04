import Search from "@/components/Search";
import TuitionPost from "@/components/TuitionPost";

export default function PricingPage() {
  const data = {
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

  return (
    <div className="w-full flex flex-col items-center justify-center gap-4">
      <Search />
      {/* <TuitionPost {...data} /> */}
    </div>
  );
}
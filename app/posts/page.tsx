import { Input } from "@heroui/input";
import { ScrollShadow } from "@heroui/scroll-shadow";
import { Chip } from "@heroui/chip";
import { IoSearch } from "react-icons/io5";
import Search from "@/components/Search";
import TuitionPost from "@/components/TuitionPost";

export default function DocsPage() {
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

  return (
    <div className="flex flex-col items-center justify-center w-full px-2">
      <Search />
      <ScrollShadow
        className="max-w-full max-h-75 no-scrollbar my-2"
        orientation="horizontal"
      >
        <div className="flex gap-2 ">
          {/* 6 chips */}
          {Array.from({ length: 6 }, (_, i) => (
            <Chip key={i} radius="sm" className="p-4 px-2">
              Chip {i + 1}
            </Chip>
          ))}
        </div>
      </ScrollShadow>
      {Array.from({ length: 6 }, (_, i) => (
        <TuitionPost key={i} {...Mockdata}/>
      ))}
    </div>
  );
}

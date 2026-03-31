"use client";
import { useRouter } from "next/navigation";
import Dock from "./ui/Dock";
import { BriefcaseBusiness, GraduationCap, HomeIcon, User } from "lucide-react";

const BottomNav = () => {
  const router = useRouter();
  const items = [
    {
      icon: <HomeIcon size={22} />,
      label: "Home",
      onClick: () => router.push("/"),
    },
    {
      icon: <GraduationCap size={22} />,
      label: "Tuitions",
      onClick: () => router.push("/posts"),
    },
    {
      icon: <BriefcaseBusiness size={22} />,
      label: "Jobs",
      onClick: () => router.push("/jobs"),
    },
    {
      icon: <User size={22} />,
      label: "Profile",
      onClick: () => router.push("/profile"),
    },
  ];
  return (
    <Dock
      items={items}
      panelHeight={40}
      baseItemSize={50}
      magnification={60}
      className="fixed bottom-4 z-100"
    />
  );
};

export default BottomNav;

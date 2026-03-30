"use client";
import { useRouter } from "next/navigation";
import Dock from "./ui/Dock";
import { BriefcaseBusiness, GraduationCap, HomeIcon, User } from "lucide-react";

const BottomNav = () => {
  const router = useRouter();
  const items = [
    {
      icon: <HomeIcon size={18} />,
      label: "Home",
      onClick: () => router.push("/"),
    },
    {
      icon: <GraduationCap size={18} />,
      label: "Tuitions",
      onClick: () => router.push("/posts"),
    },
    {
      icon: <BriefcaseBusiness size={18} />,
      label: "Jobs",
      onClick: () => router.push("/jobs"),
    },
    {
      icon: <User size={18} />,
      label: "Profile",
      onClick: () => router.push("/profile"),
    },
  ];
  return (
    <Dock
      items={items}
      panelHeight={30}
      baseItemSize={50}
      magnification={50}
      className="fixed bottom-4 z-100"
    />
  );
};

export default BottomNav;

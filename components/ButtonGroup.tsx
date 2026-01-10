"use client";
import { Button } from "@heroui/button";
import { Divider } from "@heroui/divider";
import React from "react";
import { FaChevronRight } from "react-icons/fa";
import { FcPrivacy } from "react-icons/fc";
import { useRouter } from "next/navigation";

// type for props
interface ButtonGroupProps {
  icon: React.ReactNode;
  title: string;
  link: string;
}

const ButtonGroup = ({ icon, title, link }: ButtonGroupProps) => {
  const router = useRouter();
  return (
    <section className="w-full max-w-md px-4">
      <div className="bg-white dark:bg-surface-dark rounded-xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-700 dark:divide-slate-700">
        {/* map */}
        {[
          {
            icon: <FcPrivacy size={22} className="inline-block mr-1" />,
            title: "Privacy Policy",
            link: "/privacy-policy",
          },
          {
            icon: <FcPrivacy size={22} className="inline-block mr-1" />,
            title: "Refund Policy",
            link: "/refund-policy",
          },
          {
            icon: <FcPrivacy size={22} className="inline-block mr-1" />,
            title: "Terms of Service",
            link: "/terms-of-service",
          },
        ].map((item, index) => (
          <div key={index}>
            <Button
              className="w-full rounded-none justify-between bg-white"
              size="lg"
              onClick={() => router.push(item.link)}
            >
              <span>
                {item.icon}
                {item.title}
              </span>
              <FaChevronRight size={18} className="inline-block" />
            </Button>
            <Divider />
          </div>
        ))}
      </div>
    </section>
  );
};

export default ButtonGroup;

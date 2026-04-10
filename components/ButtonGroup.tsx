"use client";

import React from "react";
import { Button } from "@heroui/button";
import { Divider } from "@heroui/divider";
import { FaChevronRight } from "react-icons/fa";
import { GlobeLock, Info, MessageSquareMore, ReceiptText } from "lucide-react";
import { RiRefund2Fill } from "react-icons/ri";
import Redirect from "./Redirect";

const items = [
  {
    icon: <GlobeLock size={22} />,
    title: "Privacy Policy",
    link: "/privacy-policy",
  },
  {
    icon: <RiRefund2Fill size={22} />,
    title: "Refund Policy",
    link: "/refund-policy",
  },
  {
    icon: <ReceiptText size={22} />,
    title: "Terms & Conditions",
    link: "/terms",
  },
  {
    icon: <Info size={22} />,
    title: "About Us",
    link: "/about",
  },
  {
    icon: <MessageSquareMore size={22} />,
    title: "Contact Us",
    link: "/contact",
  },
];

// Props type
interface ButtonGroupProps {
  className?: string;
}

const ButtonGroup: React.FC<ButtonGroupProps> = ({ className }) => {
  return (
    <section className={`w-full max-w-md ${className ?? ""}`}>
      <div className="rounded-xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-700">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <div key={index}>
              <Redirect to={item.link}>
                <Button
                  className="w-full rounded-none justify-between bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800"
                  size="lg"
                >
                  <span className="flex items-center gap-2">
                    {item.icon}
                    {item.title}
                  </span>
                  <FaChevronRight size={18} />
                </Button>
              </Redirect>

              {!isLast && <Divider />}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default ButtonGroup;

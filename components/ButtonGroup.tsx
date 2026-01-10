"use client";

import React from "react";
import { Button } from "@heroui/button";
import { Divider } from "@heroui/divider";
import { FaChevronRight } from "react-icons/fa";
import { useRouter } from "next/navigation";

// Item type
export interface ButtonGroupItem {
  icon?: React.ReactNode;
  title: string;
  link: string;
}

// Props type
interface ButtonGroupProps {
  items: ButtonGroupItem[];
  className?: string;
}

const ButtonGroup: React.FC<ButtonGroupProps> = ({ items, className }) => {
  const router = useRouter();

  return (
    <section className={`w-full max-w-md ${className ?? ""}`}>
      <div className="rounded-xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-700">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <div key={index}>
              <Button
                className="w-full rounded-none justify-between"
                size="lg"
                onClick={() => router.push(item.link)}
              >
                <span className="flex items-center gap-2">
                  {item.icon}
                  {item.title}
                </span>
                <FaChevronRight size={18} />
              </Button>

              {!isLast && <Divider />}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default ButtonGroup;

"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/config/site";
import { FaPhoneAlt } from "react-icons/fa";
import { Avatar, AvatarGroup } from "@heroui/avatar";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@heroui/dropdown";
import { Button } from "@heroui/button";
import { IoClose } from "react-icons/io5";

// Add all paths where the button should appear
const ALLOWED_PATHS = ["/", "/posts", "/jobs"];

export default function FloatingSupportCard() {
  const pathname = usePathname();

  const phoneNumber = siteConfig.contact.phone;

  const [supportAdmins, setSupportAdmins] = useState<
    { name: string; avatar?: string | null }[]
  >([]);

  const [isOpen, setIsOpen] = useState(false);

  // ✅ AFTER hooks
  if (!ALLOWED_PATHS.includes(pathname)) return null;
  return (
    <div className="fixed bottom-20 right-4 z-50 justify-items-end items-right gap-4">
      <Dropdown backdrop="blur" isOpen={isOpen} onOpenChange={setIsOpen}>
        <DropdownTrigger>
          {/* Floating Button */}
          <Button
            isIconOnly
            variant="shadow"
            className="w-12 h-12 bg-linear-to-r from-indigo-600 to-[#8A7DFF] active:scale-95 text-white hover:bg-blue-700 transition"
          >
            <FaPhoneAlt size={20} />
          </Button>
        </DropdownTrigger>
        <DropdownMenu aria-label="Static Actions" className="w-80">
          <DropdownItem key="new" className="relative">
            {/* ❌ Close Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
              }}
              className="absolute top-2 right-2 p-1 rounded-full transition"
            >
              <IoClose size={18} />
            </button>

            {/* Header */}
            <div className="flex gap-3 pr-6">
              {/* padding to avoid overlap */}
              <div className="flex items-start justify-between pb-3 py-2">
                <div>
                  <h3 className="font-semibold text-slate-800 dark:text-slate-100">
                    Talk to our team
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Have doubts or enquiries? We will be happy to assist you!
                  </p>
                </div>
              </div>
              <AvatarGroup isBordered>
                {supportAdmins.map((a) => (
                  <Avatar
                    key={a.name}
                    src={a.avatar ?? undefined}
                    name={a.name}
                    showFallback
                  />
                ))}
              </AvatarGroup>
            </div>

            {/* Call Button */}
            <div className="px-4">
              <a
                href={`tel:${phoneNumber}`}
                className="flex items-center justify-center gap-2
      w-full rounded-lg border border-blue-500
      text-blue-600 font-semibold py-3
      hover:bg-blue-50 dark:hover:bg-blue-900/20
      transition"
              >
                <FaPhoneAlt size={20} />
                {phoneNumber}
              </a>
            </div>
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </div>
  );
}

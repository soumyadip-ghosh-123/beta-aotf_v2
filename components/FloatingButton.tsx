"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/config/site";
import { FaPhoneAlt } from "react-icons/fa";
import { Avatar, AvatarGroup } from "@heroui/avatar";

// Add all paths where the button should appear
const ALLOWED_PATHS = ["/", "/posts", "/jobs"];

export default function FloatingSupportCard() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const phoneNumber = siteConfig.contact.phone;
  const [supportAdmins, setSupportAdmins] = useState<
    { name: string; avatar?: string | null }[]
  >([]);

  // Don't render on paths not in the allowed list
  if (!ALLOWED_PATHS.includes(pathname)) return null;

  return (
    <div className="fixed bottom-6 right-4 z-50 justify-items-end items-right gap-4">
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/20 backdrop-blur-md transition-opacity"
        /> 
      )}

      {/* Support Card */}
      <div
        className={`mb-4 p-2 w-80 rounded-xl bg-white dark:bg-[#151e2b] shadow-xl border border-slate-100 dark:border-slate-800 transition-all duration-300 origin-bottom-right
        ${
          open
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 translate-y-4 pointer-events-none hidden"
        }`}
      >
        {/* Header */}
        <div className="flex gap-3">
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
      </div>

      {/* Floating Button */}
      <button
        onClick={() => setOpen(!open)}
        className="w-12 h-12 rounded-full bg-linear-to-r from-indigo-600 to-[#8A7DFF] active:scale-95 text-white
        shadow-lg flex items-center justify-center
        hover:bg-blue-700 transition"
      >
        <FaPhoneAlt size={20} />
      </button>
    </div>
  );
}

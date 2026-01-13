"use client";

import { useState } from "react";
import { PersonStanding, Phone, X } from "lucide-react";
import { siteConfig } from "@/config/site";
import { RiCustomerServiceFill } from "react-icons/ri";
import { IoPersonCircleSharp } from "react-icons/io5";
import { FaPhoneAlt } from "react-icons/fa";

export default function FloatingSupportCard() {
  const [open, setOpen] = useState(false);

  const phoneNumber = siteConfig.contact.phone;

  return (
    <div className="fixed bottom-6 right-4 z-50 justify-items-end items-right gap-4">
      {/* Support Card */}
      <div
        className={`mb-4 w-80 rounded-xl bg-white dark:bg-[#151e2b]
        shadow-xl border border-slate-100 dark:border-slate-800
        transition-all duration-300 origin-bottom-right
        ${
          open
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 translate-y-4 pointer-events-none hidden"
        }`}
      >
        {/* Header */}
        <div className="flex gap-3">
          <div className="flex items-start justify-between p-4">
            <div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-100">
                Talk to an Admin
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Have doubts or enquiries? We will be happy to assist you!
              </p>
            </div>
          </div>
          <IoPersonCircleSharp
            size={80}
            className="right-5 text-slate-400 dark:text-slate-500"
          />
        </div>

        {/* Call Button */}
        <div className="px-4 pb-4">
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
        className="w-10 h-10 rounded-full bg-blue-600 text-white
        shadow-lg flex items-center justify-center
        hover:bg-blue-700 transition"
      >
        <FaPhoneAlt size={20} />
      </button>
    </div>
  );
}

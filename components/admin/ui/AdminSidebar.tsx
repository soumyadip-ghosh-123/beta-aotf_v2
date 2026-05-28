"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  LayoutDashboard,
  BookOpen,
  Briefcase,
  MessageSquare,
  Star,
  Users,
  GraduationCap,
  Megaphone,
  FileText,
  Settings,
  CalendarDays,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";

// ─── Nav items ─────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { href: "/admin",              label: "Dashboard",        icon: LayoutDashboard },
  { href: "/admin/agenda-view",  label: "Calendar",         icon: CalendarDays    },
  { href: "/admin/tuitions",     label: "Tuitions",         icon: BookOpen        },
  { href: "/admin/jobs",         label: "Jobs",             icon: Briefcase       },
  { href: "/admin/enquiries",    label: "Enquiries",        icon: MessageSquare   },
  { href: "/admin/feedbacks",    label: "Feedbacks",        icon: Star            },
  { href: "/admin/reviews",      label: "Reviews",          icon: Star            },
  { href: "/admin/users",        label: "Users",            icon: Users           },
  { href: "/admin/teachers",     label: "Renowned Teachers",icon: GraduationCap   },
  { href: "/admin/ads",          label: "Ads",              icon: Megaphone       },
  { href: "/admin/invoices",     label: "Invoices",         icon: FileText        },
  { href: "/admin/payments",     label: "Payments",         icon: FileText        },
  { href: "/admin/settings",     label: "Settings",         icon: Settings        },
];

// ─── Component ─────────────────────────────────────────────────────────────

export default function AdminSidebar() {
  const pathname  = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close on route change
  useEffect(() => { setIsOpen(false); }, [pathname]);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen]);

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const isActive = (href: string) =>
    href === "/admin"
      ? pathname === "/admin"
      : pathname.startsWith(href);

  return (
    <>
      {/* ── Hamburger button (always visible, top-left) ── */}
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Open navigation menu"
        className="fixed top-4 left-4 z-50 flex items-center justify-center w-10 h-10 rounded-xl
          bg-white/80 dark:bg-zinc-900/80 backdrop-blur border border-zinc-200 dark:border-zinc-700
          shadow-sm hover:shadow-md text-zinc-700 dark:text-zinc-200 transition-all"
      >
        <Menu size={20} />
      </button>

      {/* ── Backdrop ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* ── Drawer ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="drawer"
            ref={drawerRef}
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="fixed top-0 left-0 z-50 h-full w-72 flex flex-col
              bg-white dark:bg-zinc-900
              border-r border-zinc-200 dark:border-zinc-700
              shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200 dark:border-zinc-700">
              <span className="text-base font-semibold text-zinc-800 dark:text-zinc-100 tracking-tight">
                Admin Panel
              </span>
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Close menu"
                className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800
                  text-zinc-500 dark:text-zinc-400 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Nav links */}
            <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
              {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
                const active = isActive(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`
                      group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                      transition-all duration-150 relative
                      ${active
                        ? "bg-primary/10 text-primary dark:bg-primary/20"
                        : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100"
                      }
                    `}
                  >
                    <Icon
                      size={17}
                      className={active ? "text-primary" : "text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300"}
                    />
                    <span className="flex-1">{label}</span>
                    {active && (
                      <ChevronRight size={14} className="text-primary opacity-70" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-zinc-200 dark:border-zinc-700">
              <p className="text-xs text-zinc-400 dark:text-zinc-500">
                AOTF Admin · v2
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  label: string;
  start?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
  float?: boolean;
}

export default function Counter({
  label,
  start = 1247,
  className = "",
  prefix = "",
  suffix = "",
  float = false,
}: Props) {
  const [value, setValue] = useState(start);
  const [bumped, setBumped] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    const stored = localStorage.getItem(`counter-${label}`);
    if (stored) setValue(Number(stored));
    else localStorage.setItem(`counter-${label}`, String(start));
  }, [label, start]);

  useEffect(() => {
    localStorage.setItem(`counter-${label}`, String(value));
  }, [value, label]);

  useEffect(() => {
    const schedule = () => {
      timeoutRef.current = setTimeout(() => {
        if (!float) {
          setValue((prev) => {
            const r = Math.random();
            if (r > 0.995) return prev + Math.floor(Math.random() * 50 + 20);
            if (r > 0.97) return prev + Math.floor(Math.random() * 15 + 5);
            if (r > 0.8) return prev + Math.floor(Math.random() * 4 + 2);
            return prev + 1;
          });
        }
        setBumped(true);
        setTimeout(() => setBumped(false), 150);
        schedule();
      }, 1200 + Math.random() * 4800);
    };

    timeoutRef.current = setTimeout(schedule, 1500);
    return () => clearTimeout(timeoutRef.current);
  }, [float]);

  const formatted = float
    ? `${prefix}${value.toFixed(2)}${suffix}`
    : `${prefix}${Math.round(value).toLocaleString()}${suffix}`;

  return (
    <div
      className={`
        group rounded-xl border border-default-200 bg-content1
        px-5 py-4 transition-colors duration-200
        hover:border-default-300 hover:bg-content2
        ${className}
      `}
    >
      <p className="mb-1.5 flex items-center gap-1.5 text-[13px] text-default-500">
        <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-success" />
        {label}
      </p>
      <p
        className={`
          tabular-nums text-[28px] font-medium leading-none tracking-tight
          text-foreground transition-transform duration-100
          ${bumped ? "scale-[1.04]" : "scale-100"}
        `}
      >
        {formatted}
      </p>
    </div>
  );
}

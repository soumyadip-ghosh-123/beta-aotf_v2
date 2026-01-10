import { ScrollShadow } from "@heroui/scroll-shadow";
import React from "react";

const ScrollBanner = () => {
  return (
    <div>
      <h1 className="text-lg font-bold text-slate-900 dark:text-white">
        We are assosiated with
      </h1>
      <ScrollShadow
        className="max-w-sm max-h-75 no-scrollbar p-3"
        orientation="horizontal"
      >
        <div className="flex gap-2 px-4">
          {/* 6 buttons */}
          {Array.from({ length: 6 }, (_, i) => (
            <div
              key={i}
              className="flex h-20 w-40 shrink-0 items-center justify-center rounded-lg bg-gradient-to-r from-primary to-blue-500 text-white shadow-lg"
            >
              Brand with name {i + 1}
            </div>
          ))}
        </div>
      </ScrollShadow>
    </div>
  );
};

export default ScrollBanner;

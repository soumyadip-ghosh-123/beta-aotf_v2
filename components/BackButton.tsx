"use client";

import { Button } from "@heroui/button";
import React from "react";
import { FaChevronLeft } from "react-icons/fa";
import { useRouter } from "next/navigation";

interface BackButtonProps {
  title?: string;
}

const BackButton = ({ title }: BackButtonProps) => {
  const router = useRouter();

  return (
    <div className="grid grid-cols-3 items-center mb-2">
      <Button
        isIconOnly
        aria-label="Back"
        color="default"
        size="sm"
        onPress={() => router.back()}
      >
        <FaChevronLeft size={20} />
      </Button>

      <h2 className="text-center text-lg font-bold text-gray-900 dark:text-white">
        {title || "Page Title"}
      </h2>

      <div />
    </div>
  );
};

export default BackButton;

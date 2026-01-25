"use client";

import { Button } from "@heroui/button";
import { FaChevronLeft } from "react-icons/fa";
import { useRouter } from "next/navigation";

interface BackButtonProps {
  title?: string;
}

const BackButton = ({ title }: BackButtonProps) => {
  const router = useRouter();

  return (
    <div className="grid grid-cols-3 items-center mb-2 max-w-3xl w-full mx-auto px-2">
      <Button
        isIconOnly
        aria-label="Back"
        color="default"
        size="sm"
        onPress={() => router.back()}
      >
        <FaChevronLeft size={20} />
      </Button>

      <p className="text-center text-lg font-semibold">
        {title || "Page Title"}
      </p>

      <div />
    </div>
  );
};

export default BackButton;

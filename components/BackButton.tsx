"use client";

import { Button } from "@heroui/button";
import { FaChevronLeft } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface BackButtonProps {
  title?: string;
}

const BackButton = ({ title }: BackButtonProps) => {
  const router = useRouter();
  const [canGoBack, setCanGoBack] = useState(false);

  useEffect(() => {
    if (window.history.length > 1 || document.referrer !== "") {
      setCanGoBack(true);
    }
  }, []);

  return (
    <div className="grid grid-cols-3 items-center mb-2 max-w-3xl w-full mx-auto px-2">
      {canGoBack ? (
        <Button
          isIconOnly
          aria-label="Back"
          color="default"
          size="sm"
          onPress={() => router.back()}
        >
          <FaChevronLeft size={20} />
        </Button>
      ) : (
        <div /> // keeps layout aligned
      )}

      <p className="text-center text-lg font-semibold">
        {title || ""}
      </p>

      <div />
    </div>
  );
};

export default BackButton;

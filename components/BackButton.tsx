"use client";

import { Button } from "@heroui/button";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";

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
    <div className="grid grid-cols-3 items-center mb-2 px-3 w-full">
      {canGoBack ? (
        <Button
          size="sm"
          variant="flat"
          startContent={<ArrowLeft size={18} />}
          aria-label="Back"
          color="default"
          onPress={() => router.back()}
          className="justify-start w-fit"
        >
          Back
        </Button>
      ) : (
        <div /> // keeps layout aligned
      )}

      <p className="text-center text-lg font-semibold">{title || ""}</p>

      <div />
    </div>
  );
};

export default BackButton;

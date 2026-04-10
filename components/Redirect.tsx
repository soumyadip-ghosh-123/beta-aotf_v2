"use client";

import { ReactNode, isValidElement, cloneElement, MouseEvent } from "react";
import { useRouter } from "next/navigation";

type ClickableProps = {
  onClick?: (e: MouseEvent<any>) => void;
};

type RedirectProps = {
  to: string;
  children: ReactNode;
};

export default function Redirect({ to, children }: RedirectProps) {
  const router = useRouter();

  const handleClick = (e: MouseEvent<any>) => {
    e.preventDefault();
    router.push(to);
  };

  // ✅ If it's a valid React element
  if (isValidElement<ClickableProps>(children)) {
    return cloneElement(children, {
      onClick: handleClick,
    });
  }

  // ✅ If it's text or anything else
  return (
    <span onClick={handleClick} style={{ cursor: "pointer" }}>
      {children}
    </span>
  );
}

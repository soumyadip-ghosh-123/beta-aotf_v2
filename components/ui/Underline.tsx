import React from "react";

interface UnderlineProps {
  title: string;
  className?: string;
  color?: string;
  size?: "small" | "medium" | "large";
}

const Underline = ({ title, className, color, size }: UnderlineProps) => {
  return (
    <div className={`w-full ${className}`}>
      <span
        className={`font-bold ${size === "small" ? "text-xl" : size === "large" ? "text-3xl" : "text-3xl"} relative inline-block stroke-current text-${color}`}
      >
        {title}
        <svg
          className="absolute -bottom-0.5 w-full max-h-1.5"
          viewBox="0 0 55 5"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <path
            d="M0.652466 4.00002C15.8925 2.66668 48.0351 0.400018 54.6853 2.00002"
            strokeWidth="2"
          ></path>
        </svg>
      </span>
    </div>
  );
};

export default Underline;

import FeedbackForm from "@/components/FeedbackForm";
import React from "react";

const page = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] w-full">
      <FeedbackForm />
    </div>
  );
};

export default page;

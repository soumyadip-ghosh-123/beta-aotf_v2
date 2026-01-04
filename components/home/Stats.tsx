import { Card } from "@heroui/card";
import React from "react";

const Stats = () => {
  return (
    <Card className="p-4 max-w-md  mx-auto flex flex-row items-center justify-evenly">
      <div className="h-full flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-slate-900 dark:text-white">
          10k+
        </span>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          Students
        </span>
      </div>
      <div className="h-full flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-slate-900 dark:text-white">
          5k+
        </span>
        <span className="text-xs text-slate-500 dark:text-slate-400">Jobs</span>
      </div>
      <div className="h-full flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-slate-900 dark:text-white">
          2k+
        </span>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          Freelancers
        </span>
      </div>
    </Card>
  );
};

export default Stats;

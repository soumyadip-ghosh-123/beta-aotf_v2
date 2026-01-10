import { Button } from "@heroui/button";
import { Card, CardHeader } from "@heroui/card";
import React from "react";
import { GoGoal } from "react-icons/go";
const CTA = () => {
  return (
    <section className="w-full">
      <Card className="p-4">
        <CardHeader className="flex items-center justify-center gap-3">
          <GoGoal className="h-6 w-6 flex-shrink-0" />
          <h3 className="text-lg font-bold bg-orange-400">
            &nbsp;Our Motto&nbsp;
          </h3>
        </CardHeader>
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <p className="mt-1 text-sm font-justify">
              At <strong>AOTF (Academy of Tutorials & Freelancers)</strong>, we
              <span className="bg-[#F1BBB9]">
                &nbsp;connect teachers with genuine tuition needs&nbsp;
              </span>
              from guardians and
              <span className="bg-[#ffd18d]">
                &nbsp;skilled talents with verified part-time and full-time job
                opportunities.&nbsp;
              </span>
              &nbsp;
              <span className="bg-[#b9f1b9]">
                &nbsp;Through trust, transparency, and structured processes
                &nbsp;
              </span>
              , we ensure every connection is reliable, meaningful, and driven
              by real outcomes.
            </p>
          </div>
        </div>
      </Card>
    </section>
  );
};

export default CTA;

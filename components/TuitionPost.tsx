"use client";
import { User } from "@heroui/user";
import { Card, CardHeader, CardBody, CardFooter } from "@heroui/card";
import { Button } from "@heroui/button";
import { useState } from "react";
import { Chip } from "@heroui/chip";
import { FaMapMarkerAlt } from "react-icons/fa";
import { BsCurrencyRupee } from "react-icons/bs";
import { LuNotebookText } from "react-icons/lu";
import { FaArrowRight } from "react-icons/fa";
import { FaEye } from "react-icons/fa";
import { MdDoneAll } from "react-icons/md";
import { FaShareFromSquare } from "react-icons/fa6";
import { SlCalender } from "react-icons/sl";
import { FaBookOpen } from "react-icons/fa";

const TuitionPost = ( ) => {
  const [isApplied, setIsApplied] = useState(false);
  return (
    <Card className="max-w-115 w-full mx-auto pt-3">
      <CardHeader className="justify-between">
        <User
          avatarProps={{
            src: "https://i.pravatar.cc/150?u=a04258114e29026702d",
          }}
          description="Admin • Posted 2h ago"
          name="Soumoy Debnath"
        />
        <Chip radius="sm" className="bg-default-200">
          3 Applicants
        </Chip>
      </CardHeader>
      <CardBody className="px-3 py-0 text-small text-default-400">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-3 leading-snug">
          Science Tuition Needed
        </h1>
        {/* 3 chips with map function */}
        <div className="flex gap-2">
          {["Class 8", "ICSE", "Science"].map((skill) => (
            <Chip
              key={skill}
              radius="sm"
              variant="faded"
              size="sm"
              className="bg-default-100"
            >
              {skill}
            </Chip>
          ))}
        </div>

        <div className="flex items-start gap-3 group my-2">
          <div className="shrink-0 w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-primary flex items-center justify-center transition-colors group-hover:bg-primary group-hover:text-white">
            <FaMapMarkerAlt size={20} />
          </div>
          <div className="flex flex-col pt-0.5">
            <span className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-0.5">
              Location
            </span>
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100 leading-snug">
              Dhakuria near Metro Station
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3 group my-2">
          <div className="shrink-0 w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-primary flex items-center justify-center transition-colors group-hover:bg-primary group-hover:text-white">
            <BsCurrencyRupee size={20} />
          </div>
          <div className="flex flex-col pt-0.5">
            <span className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-0.5">
              Price
            </span>
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100 leading-snug">
              ₹500/hour
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <Card className="w-full p-3 h-fit">
            <CardHeader className="p-0 mb-2">
              <SlCalender
                size={20}
                className="text-primary inline-block mr-2"
              />
              <h3 className="text-md font-bold">Frequency</h3>
            </CardHeader>
            <p className="text-sm">Twice/Week</p>
          </Card>
          <Card className="w-full p-3 h-fit">
            <CardHeader className="p-0 mb-2">
              <FaBookOpen
                size={20}
                className="text-primary inline-block mr-2"
              />
              <h3 className="text-md font-bold">Class Type</h3>
            </CardHeader>
            <p className="text-sm">In-Person / Online</p>
          </Card>
        </div>
        <div className="mt-2 mb-4">
          <div className="flex gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/30 p-2 rounded-lg">
            <LuNotebookText
              size={24}
              className="text-amber-600 dark:text-amber-400"
            />
            <div className="flex flex-col justify-center">
              <p className="text-xs font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wide mb-0.5">
                Requirement
              </p>
              <p className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed font-medium">
                Only Female Teacher Required
              </p>
            </div>
          </div>
        </div>
      </CardBody>
      {/* <Divider /> */}
      <CardFooter className="gap-3">
        <div className="grid grid-cols-3 gap-2 justify-between w-full">
          <Button size="sm" className="bg-default-200">
            View Details
            <FaEye />
          </Button>
          <Button size="sm" color="secondary" variant="bordered">
            Share
            <FaShareFromSquare />
          </Button>
          <Button
            size="sm"
            color={isApplied ? "default" : "primary"}
            isDisabled={isApplied}
            onClick={() => setIsApplied(true)}
          >
            {isApplied ? "Applied" : "Apply Now"}
            {isApplied ? <MdDoneAll /> : <FaArrowRight />}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default TuitionPost;

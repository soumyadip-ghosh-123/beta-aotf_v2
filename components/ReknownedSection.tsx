"use client";

import React from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Avatar } from "@heroui/avatar";
import { ScrollShadow } from "@heroui/scroll-shadow";
import Underline from "./ui/Underline";

const testimonials = [
  {
    name: "Dr. Ananya Sharma",
    designation: "Physics Faculty • IIT-JEE",
    image: "https://i.pravatar.cc/150?img=32",
    quote:
      "Concept clarity and consistent practice are the keys to cracking competitive exams.",
  },
  {
    name: "Prof. Rajiv Mehta",
    designation: "Mathematics Mentor",
    image: "https://i.pravatar.cc/150?img=12",
    quote:
      "Focus on fundamentals first — speed and accuracy will follow naturally.",
  },
  {
    name: "Neha Verma",
    designation: "Chemistry Educator",
    image: "https://i.pravatar.cc/150?img=45",
    quote: "Learning should be engaging, practical, and driven by curiosity.",
  },
  {
    name: "Amitabh Singh",
    designation: "Biology Tutor",
    image: "https://i.pravatar.cc/150?img=22",
    quote: "Understanding concepts deeply is the key to success in biology.",
  },
  {
    name: "Sonal Kapoor",
    designation: "English Language Coach",
    image: "https://i.pravatar.cc/150?img=30",
    quote:
      "Language is the road map of a culture. It tells you where its people come from and where they are going.",
  },
  {
    name: "Vikram Joshi",
    designation: "History Instructor",
    image: "https://i.pravatar.cc/150?img=18",
    quote:
      "History is not just about the past; it's a guide to understanding the present and shaping the future.",
  },
  {
    name: "Dr. Ananya Sharma",
    designation: "Physics Faculty • IIT-JEE",
    image: "https://i.pravatar.cc/150?img=32",
    quote:
      "Concept clarity and consistent practice are the keys to cracking competitive exams.",
  },
  {
    name: "Prof. Rajiv Mehta",
    designation: "Mathematics Mentor",
    image: "https://i.pravatar.cc/150?img=12",
    quote:
      "Focus on fundamentals first — speed and accuracy will follow naturally.",
  },
  {
    name: "Neha Verma",
    designation: "Chemistry Educator",
    image: "https://i.pravatar.cc/150?img=45",
    quote: "Learning should be engaging, practical, and driven by curiosity.",
  }
];

const ReknownedSection = () => {
  return (
    <div className="w-full max-w-7xl flex flex-col my-10 ">
      <Underline
        title="Reknowned Teachers"
        className="text-center"
        size="small"
      />
      <ScrollShadow
        orientation="horizontal"
        className="w-full py-4 no-scrollbar"
      >
        <div className="flex gap-4 px-4">
          {testimonials.map((item, index) => (
            <Card
              key={index}
              className="min-w-70 max-w-70
            shadow-sm border border-slate-100
            dark:border-slate-800"
            >
              <CardHeader className="flex gap-3 items-center">
                <Avatar
                  src={item.image}
                  alt={item.name}
                  size="lg"
                  radius="full"
                />

                <div className="flex flex-col">
                  <p className="font-semibold text-slate-800 dark:text-slate-100">
                    {item.name}
                  </p>
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    {item.designation}
                  </span>
                </div>
              </CardHeader>

              <CardBody className="pt-0">
                <p className="text-sm italic text-slate-600 dark:text-slate-300 leading-relaxed">
                  “{item.quote}”
                </p>
              </CardBody>
            </Card>
          ))}
        </div>
      </ScrollShadow>
    </div>
  );
};

export default ReknownedSection;

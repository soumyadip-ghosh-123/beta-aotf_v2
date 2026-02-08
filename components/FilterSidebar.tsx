import { Button } from "@heroui/button";
import { Select, SelectItem } from "@heroui/select";
import { Checkbox } from "@heroui/checkbox";
import { X } from "lucide-react";
import { Slider } from "@heroui/slider";
import { useState } from "react";
export default function FilterSidebar({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      )}

      <div
        className={`fixed top-0 left-0 h-full w-80 bg-background z-50
        transform transition-transform duration-300
        ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="text-lg font-semibold">Filters</h3>
          <Button isIconOnly variant="light" onPress={onClose}>
            <X size={18} />
          </Button>
        </div>

        {/* Body */}
        <div className="p-4 flex flex-col gap-4">
          {/* <Select label="Class">
            {[6, 7, 8, 9, 10, 11, 12].map((c) => (
              <SelectItem key={c}>Class {c}</SelectItem>
            ))}
          </Select> */}

          <Select
            label="Subject"
            selectionMode="multiple"
            defaultSelectedKeys={["all"]}
          >
            <SelectItem key="all">All</SelectItem>
            <SelectItem key="math">Math</SelectItem>
            <SelectItem key="science">Science</SelectItem>
            <SelectItem key="english">English</SelectItem>
          </Select>

          <Select
            label="Board"
            selectionMode="multiple"
            defaultSelectedKeys={["all"]}
          >
            <SelectItem key="all">All</SelectItem>
            <SelectItem key="cbse">CBSE</SelectItem>
            <SelectItem key="icse">ICSE</SelectItem>
          </Select>

          <Select label="classtype" defaultSelectedKeys={["both"]}>
            <SelectItem key="inperson">In-Person</SelectItem>
            <SelectItem key="online">Online</SelectItem>
            <SelectItem key="both">Both</SelectItem>
          </Select>

          <Slider
            showTooltip
            className="max-w-md"
            defaultValue={[500, 5000]}
            formatOptions={{ style: "currency", currency: "INR" }}
            label="Price Range"
            maxValue={5000}
            minValue={500}
            showSteps={true}
            step={500}
          />
          <div className="flex gap-3">
            <Button variant="bordered" className="w-full">
              Reset
            </Button>
            <Button color="primary" className="w-full">
              Apply
            </Button>

            {/* 
                subject 
                board  ✅
                class 
                location 
                online/offline ✅
                salary range ✅
            
            academicData: {
              class: [6,7,8,9,10,11,12];
              board: ["icse" , "cbse", "state"],
              subject: ["math", "science", "english", "history", "geography" ... ],
              location: string,
              classType: ["online" , "inperson" , "both"],
            }


            postData: {
            name:   
            location: string;
            isOnline: boolean;
            board: "ICSE"
            */}
          </div>
        </div>
      </div>
    </>
  );
}

"use client";

import BackButton from "@/components/BackButton";
import { Tab, Tabs } from "@heroui/tabs";
import React from "react";
import { LiaCheckDoubleSolid } from "react-icons/lia";
import { LuNotebookPen } from "react-icons/lu";
import { RxCross2 } from "react-icons/rx";

const page = () => {
  return (
    <div className="w-full">
      <BackButton title="Dashboard" />

      <div className="flex w-full flex-col items-center">
        <Tabs aria-label="Options" color="primary" variant="bordered">
          <Tab
            key="info"
            title={
              <div className="flex items-center space-x-2">
                <LuNotebookPen size={20} />
                <span>Info</span>
              </div>
            }
          >
            {/* Tab content */}
            <div className="p-4">
              <h2 className="font-semibold">Information</h2>
              <p>This is the Info tab content.</p>
            </div>
          </Tab>

          <Tab
            key="approved"
            title={
              <div className="flex items-center space-x-2">
                <LiaCheckDoubleSolid size={20} />
                <span>Approved</span>
              </div>
            }
          >
            <div className="p-4">
              <h2 className="font-semibold">Approved Items</h2>
              <p>List of approved entries.</p>
            </div>
          </Tab>

          <Tab
            key="rejected"
            title={
              <div className="flex items-center space-x-2">
                <RxCross2 size={20} />
                <span>Rejected</span>
              </div>
            }
          >
            <div className="p-4">
              <h2 className="font-semibold">Rejected Items</h2>
              <p>List of rejected entries.</p>
            </div>
          </Tab>
        </Tabs>
      </div>
    </div>
  );
};

export default page;

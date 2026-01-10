"use client";
import TabContent from "@/components/teacher/profile/TabContent";
import { Avatar } from "@heroui/avatar";
import { Card, CardFooter, CardHeader } from "@heroui/card";
import { Tab, Tabs } from "@heroui/tabs";
import { LuNotebookPen } from "react-icons/lu";
import { LiaCheckDoubleSolid } from "react-icons/lia";
import { RxCross2 } from "react-icons/rx";


const page = () => {
  return (
    <div className="w-full">
      {/* Profile Header */}
      <div className="flex flex-row items-center justify-start gap-4 py-4">
        <Avatar
          className="w-20 h-20 text-large"
          src="https://i.pravatar.cc/150?u=a04258114e29026708c"
        />
        <div className="flex flex-col items-start">
          <h1 className="text-xl font-semibold">Somnath Roy</h1>
          <p className="text-sm text-gray-500">Location: New York, USA</p>
          <p className="text-sm text-gray-500">
            Bio: A passionate educator and lifelong learner.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 pb-4 justify-center">
        <Card radius="md" className="text-center px-4 py-2 m-0">
          <h2 className="text-lg font-semibold">12</h2>
          <p className="text-sm text-gray-500">Applied</p>
        </Card>
        <Card radius="md" className="text-center px-4 py-2 m-0">
          <h2 className="text-lg font-semibold">5</h2>
          <p className="text-sm text-gray-500">Approved</p>
        </Card>
        <Card radius="md" className="text-center px-4 py-2 m-0">
          <h2 className="text-lg font-semibold">9</h2>
          <p className="text-sm text-gray-500">Rejected</p>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex w-full flex-col items-center">
        <Tabs aria-label="Options" color="primary" variant="bordered">
          <Tab
            key="photos"
            title={
              <div className="flex items-center space-x-2">
                <LuNotebookPen size={20} className="font-bold" />
                <span>Applied</span>
              </div>
            }
          />
          <Tab
            key="music"
            title={
              <div className="flex items-center space-x-2">
                <LiaCheckDoubleSolid size={20} className="font-bold" />
                <span>Approved</span>
              </div>
            }
          />
          <Tab
            key="videos"
            title={
              <div className="flex items-center space-x-2">
                <RxCross2 size={20} className="font-bold" />
                <span>Rejected</span>
              </div>
            }
          />
        </Tabs>
      </div>

      {/* Tabs Content */}
      <div className="w-full">
        <TabContent />
        <TabContent />
        <TabContent />
      </div>
    </div>
  );
};

export default page;

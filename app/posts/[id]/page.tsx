import { Button } from "@heroui/button";
import { Card, CardHeader } from "@heroui/card";
import { FaHome } from "react-icons/fa";
import { LuMapPin, LuNotebookText } from "react-icons/lu";
import { SlCalender, SlShare } from "react-icons/sl";
import { PiClockCountdownFill } from "react-icons/pi";
import BackButton from "@/components/BackButton";

const page = () => {
  return (
    <div className="w-full max-w-xl p-2">
      <BackButton title="Post Details" />

      {/* Post Header */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium tracking-wide ">
            Post ID: #12345
          </p>
          <div className="flex h-7 items-center justify-center px-3 rounded-full bg-green-100 dark:bg-green-900/40 border border-green-200 dark:border-green-800">
            <span className="text-green-700 dark:text-green-300 text-xs font-bold uppercase tracking-wider">
              Open
            </span>
          </div>
        </div>
        <h1 className="text-gray-900 dark:text-white text-[28px] font-bold leading-[1.2] mb-1">
          Physics for Class 10
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-base font-medium mb-3">
          CBSE Board
        </p>
        <div className="flex items-baseline gap-2 mb-4">
          <h2 className="text-primary text-[26px] font-bold tracking-tight">
            ₹2000
          </h2>
          <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
            /month
          </span>
        </div>
      </div>

      {/* Class Details */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-2 justify-center items-center">
          <CardHeader className="justify-center p-1">
            <FaHome size={30} className="text-primary" />
          </CardHeader>
          <p className="text-sm text-center">Offline At Home</p>
        </Card>
        <Card className="p-2 justify-center items-center">
          <CardHeader className="justify-center p-1">
            <SlCalender size={30} className="text-primary" />
          </CardHeader>
          <p className="text-sm text-center">3 Days Per Week</p>
        </Card>
        <Card className="p-2 justify-center items-center">
          <CardHeader className="justify-center p-1">
            <PiClockCountdownFill size={30} className="text-primary" />
          </CardHeader>
          <p className="text-sm text-center">
            Evening <br />5 PM - 7 PM
          </p>
        </Card>
      </div>

      {/* Notes */}
      <div className="my-4">
        <div className="flex gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/30 p-2 rounded-lg">
          <LuNotebookText
            className="text-amber-600 dark:text-amber-400"
            size={35}
          />
          <div className="flex flex-col justify-center">
            <p className="text-md font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wide mb-0.5">
              Notes
            </p>
            <p className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed font-medium">
              Looking for an experienced Physics tutor who can help my child
              excel in Class 10 CBSE curriculum. Prefer weekend classes.
            </p>
          </div>
        </div>
      </div>

      {/* Post information */}
      <Card className="w-full p-4 mb-4">
        <CardHeader className="p-0">
          <PiClockCountdownFill
            size={30}
            className="text-primary inline-block mr-2"
          />
          <h3 className="text-lg font-bold">Schedule & Timing</h3>
        </CardHeader>
        <div className="mt-3 px-3 space-y-3">
          <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-700">
            <span className="text-gray-500 dark:text-gray-400 text-sm">
              Preferred Days
            </span>
            <span className="text-gray-900 dark:text-white font-medium text-sm text-right">
              Mon, Wed, Fri
            </span>
          </div>
          <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-700">
            <span className="text-gray-500 dark:text-gray-400 text-sm">
              Subjects
            </span>
            <span className="text-gray-900 dark:text-white font-medium text-sm text-right">
              Physics, Chemistry, Maths
            </span>
          </div>
          <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-700">
            <span className="text-gray-500 dark:text-gray-400 text-sm">
              Duration
            </span>
            <span className="text-gray-900 dark:text-white font-medium text-sm text-right">
              1.5-2 hour/class
            </span>
          </div>
        </div>
      </Card>

      {/* location card with map */}
      <Card className="w-full p-4 mb-4">
        <CardHeader className="p-0">
          <LuMapPin size={30} className="text-primary inline-block mr-2" />
          <h3 className="text-lg font-bold">Location</h3>
        </CardHeader>
        <p className="mt-3 px-3 text-md font-medium text-slate-600 dark:text-slate-100 leading-snug">
          Block BE, Salt Lake City, Sector 1, Kolkata, West Bengal - 700064
        </p>
      </Card>

      {/* Action Buttons */}
      <div className=" flex gap-4 max-w-xl mx-auto z-10">
        <Button className="w-full" size="lg">
          <SlShare size={18} className="inline-block mr-2" />
          Share
        </Button>

        <Button className="w-full" size="lg" color="primary">
          Apply Now
        </Button>
      </div>
    </div>
  );
};

export default page;

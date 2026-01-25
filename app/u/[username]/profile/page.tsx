"use client";
import { Avatar } from "@heroui/avatar";
import { Badge } from "@heroui/badge";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Tab, Tabs } from "@heroui/tabs";
import { LuNotebookPen } from "react-icons/lu";
import { LiaCheckDoubleSolid } from "react-icons/lia";
import { RxCross2 } from "react-icons/rx";
import ButtonGroup from "@/components/ButtonGroup";
import { FcPrivacy } from "react-icons/fc";
import { FaLocationDot } from "react-icons/fa6";
import {
  FaBook,
  FaChalkboardTeacher,
  FaMailBulk,
  FaPhone,
  FaUser,
} from "react-icons/fa";
import { Chip } from "@heroui/chip";
import BackButton from "@/components/BackButton";
import { IoNotificationsCircleOutline } from "react-icons/io5";

const page = () => {
  const items = [
    {
      icon: <FcPrivacy size={22} />,
      title: "Payment Methods",
      link: "/privacy-policy",
    },
    {
      icon: <FcPrivacy size={22} />,
      title: "Privacy Policy",
      link: "/privacy-policy",
    },
    {
      icon: <FcPrivacy size={22} />,
      title: "Logout",
      link: "/terms",
    },
  ];
  return (
    <div className="w-full">
      <BackButton title="Profile" />
      {/* Profile Header */}
      <div className="md:flex justify-between items-center max-w-3xl mx-auto">
        <div className="flex flex-row items-center justify-start gap-4 py-4">
          <Badge
            isOneChar
            color="danger"
            content={<IoNotificationsCircleOutline size={100} />}
            placement="top-right"
            shape="circle"
            showOutline={false}
          >
            <Avatar
              className="w-20 h-20 text-large"
              src="https://i.pravatar.cc/150?u=a04258114e29026708c"
            />
          </Badge>
          <div className="flex flex-col items-start gap-1">
            <h1 className="text-xl font-semibold">Somnath Roy</h1>
            <div className="flex items-center gap-1">
              <FaLocationDot />
              <p className="text-sm text-gray-500">New York, USA</p>
            </div>
            <div className="flex gap-1">
              <FaUser />
              <p className="text-sm text-gray-500">
                A passionate educator and lifelong learner.
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 pb-4 justify-center">
          <Card radius="md" className="text-center px-4 py-2 m-0 justify-center">
            <p className="font-bold text-lg">12+</p>
            <p className="text-xs text-[#4c6c9a] dark:text-slate-400">
              YEARS EXP
            </p>
          </Card>
          <Card radius="md" className="text-center px-4 py-2 m-0 justify-center">
            <p className="font-bold text-lg">5+</p>
            <p className="text-xs text-[#4c6c9a] dark:text-slate-400">
              GUIDING STUDENTS
            </p>
          </Card>
          <Card radius="md" className="text-center px-4 py-2 m-0 justify-center">
            <p className="font-bold text-lg">9+</p>
            <p className="text-xs text-[#4c6c9a] dark:text-slate-400">
              YEARS ON AOTF
            </p>
          </Card>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex w-full flex-col items-center">
        <Tabs aria-label="Options" color="primary" variant="bordered">
          <Tab
            key="photos"
            title={
              <div className="flex items-center space-x-2">
                <LuNotebookPen size={20} className="font-bold" />
                <span>info</span>
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

      <div className="space-y-2 my-5">
        {/* qualification details */}
        <Card className="p-4 max-w-lg mx-auto">
          <CardHeader className="flex items-center gap-2 p-0">
            <FaBook className="text-primary" />
            <h3 className="text-lg font-bold">Education &amp; Qualification</h3>
          </CardHeader>
          <CardBody className="space-y-3 p-2">
            <div className="flex gap-4">
              <div className="shrink-0 w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <FaBook className="text-slate-500" />
              </div>
              <div>
                <p className="font-bold text-sm">M.Sc in Physics</p>
                <p className="text-xs text-[#4c6c9a] dark:text-slate-400">
                  Jadavpur University • 2014 - 2016
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="shrink-0 w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <FaBook className="text-slate-500" />
              </div>
              <div>
                <p className="font-bold text-sm">B.Sc in Physics (Hons)</p>
                <p className="text-xs text-[#4c6c9a] dark:text-slate-400">
                  University of Calcutta • 2011 - 2014
                </p>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Teaching details */}
        <Card className="p-4 max-w-lg mx-auto">
          <CardHeader className="flex items-center gap-2 p-0">
            <FaChalkboardTeacher className="text-primary" />
            <h3 className="text-lg font-bold">Contact Details</h3>
          </CardHeader>
          <CardBody className="space-y-3 p-2">
            <div className="flex gap-4">
              <div className="shrink-0 w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <FaMailBulk className="text-slate-500" />
              </div>
              <div>
                <p className="text-xs text-[#4c6c9a] dark:text-slate-400">
                  Email Id:
                </p>
                <p className="font-bold text-sm">soumyadip@example.com</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="shrink-0 w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <FaPhone className="text-slate-500" />
              </div>
              <div>
                <p className="text-xs text-[#4c6c9a] dark:text-slate-400">
                  Phone Number:
                </p>
                <p className="font-bold text-sm">+91 94567-38901</p>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* contact details */}
        <Card className="p-4 max-w-lg mx-auto">
          <CardHeader className="flex items-center gap-2 p-0">
            {/* <FaBook className="text-primary" /> */}
            <h3 className="text-lg font-bold">Teaching Style</h3>
          </CardHeader>
          <CardBody className="space-y-3 p-2">
            <div className="flex gap-2">
              <Chip variant="shadow" className="bg-green-100 text-green-800">
                Bengali
              </Chip>
              <Chip variant="shadow" className="bg-green-100 text-green-800">
                English
              </Chip>
              <Chip variant="shadow" className="bg-green-100 text-green-800">
                Math
              </Chip>
              <Chip variant="shadow" className="bg-green-100 text-green-800">
                History
              </Chip>
            </div>
          </CardBody>
          <CardHeader className="flex items-center gap-2 p-0">
            {/* <FaBook className="text-primary" /> */}
            <h3 className="text-md font-semibold">Teaching Mode</h3>
          </CardHeader>
          <CardBody className="space-y-3 p-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-100 text-zinc-700 rounded-2xl p-3 text-center font-semibold">
                Online
              </div>
              <div className="bg-blue-100 text-zinc-700 rounded-2xl p-3 text-center font-semibold">
                Offline
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Professional Details */}
        <ProfessionalDetailsCard
          qualification="M.Sc in Mathematics"
          schoolBoard="CBSE"
          subjects={["Mathematics", "Physics", "Chemistry"]}
          teachingMode="Online"
        />
      </div>

      {/* Tabs Content */}
      <div className="w-full"></div>

      {/* Action Buttons */}
      <div className="w-full mb-8">
        <ButtonGroup items={items} className="px-auto mx-auto" />
      </div>
    </div>
  );
};

function ProfessionalDetailsCard({
  qualification,
  schoolBoard,
  subjects,
  teachingMode,
}: {
  qualification: string;
  schoolBoard: string;
  subjects: string[];
  teachingMode: string;
}) {
  return (
    <Card>
      <CardBody className="p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Professional Details</h3>
        </div>

        <div className="flex flex-col gap-3">
          {/* Qualification */}
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              🎓
            </div>
            <div>
              <p className="text-xs text-[#4c6c9a] dark:text-slate-400">
                Qualifications
              </p>
              <p className="font-bold text-sm">{qualification}</p>
            </div>
          </div>

          {/* School Board */}
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
              📘
            </div>
            <div>
              <p className="text-xs text-[#4c6c9a] dark:text-slate-400">
                School Board
              </p>
              <p className="font-bold text-sm">{schoolBoard}</p>
            </div>
          </div>

          {/* Subjects */}
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
              🔬
            </div>
            <div>
              <p className="text-xs text-[#4c6c9a] dark:text-slate-400">
                Subjects
              </p>
              <div className="flex flex-wrap gap-2">
                {subjects.map((s) => (
                  <Chip key={s} variant="shadow" className="font-bold text-sm">
                    {s}
                  </Chip>
                ))}
              </div>
            </div>
          </div>

          {/* Teaching Mode */}
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
              📡
            </div>
            <div>
              <p className="text-xs text-[#4c6c9a] dark:text-slate-400">
                Teaching Mode
              </p>
              <p className="font-bold text-sm">
                {teachingMode} (Online & Offline)
              </p>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

export default page;

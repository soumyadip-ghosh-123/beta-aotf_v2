import { Button } from "@heroui/button";
import { Card, CardHeader } from "@heroui/card";
import { LuNotebookText } from "react-icons/lu";
import { SlShare } from "react-icons/sl";
import {
  FaMapMarkerAlt,
  FaUserAlt,
  FaBuilding,
  FaBriefcase,
} from "react-icons/fa";
import { BsCurrencyRupee } from "react-icons/bs";
import { FaClock } from "react-icons/fa6";
import { MdOutlineWifiTethering, MdOutlineStorefront } from "react-icons/md";
import BackButton from "@/components/BackButton";
import { getJobByJobId } from "@/lib/services/job.service";
import { notFound } from "next/navigation";

/* ─── Helpers ─────────────────────────────────────────────────── */

const getStatusBadge = (status: string) => {
  const colors: Record<string, { bg: string; border: string; text: string }> = {
    open: {
      bg: "bg-green-100 dark:bg-green-900/40",
      border: "border-green-200 dark:border-green-800",
      text: "text-green-700 dark:text-green-300",
    },
    hold: {
      bg: "bg-yellow-100 dark:bg-yellow-900/40",
      border: "border-yellow-200 dark:border-yellow-800",
      text: "text-yellow-700 dark:text-yellow-300",
    },
    closed: {
      bg: "bg-red-100 dark:bg-red-900/40",
      border: "border-red-200 dark:border-red-800",
      text: "text-red-700 dark:text-red-300",
    },
    cancelled: {
      bg: "bg-red-100 dark:bg-red-900/40",
      border: "border-red-200 dark:border-red-800",
      text: "text-red-700 dark:text-red-300",
    },
  };
  return colors[status] ?? colors.open;
};

const getLocationIcon = (type: string) => {
  switch (type) {
    case "remote":
      return {
        icon: <MdOutlineWifiTethering size={30} className="text-primary" />,
        label: "Remote",
      };
    case "hybrid":
      return {
        icon: <MdOutlineStorefront size={30} className="text-primary" />,
        label: "Hybrid",
      };
    default:
      return {
        icon: <FaMapMarkerAlt size={28} className="text-primary" />,
        label: "On-Site",
      };
  }
};

const getWorkTypeIcon = (type: string) => {
  switch (type) {
    case "project":
      return {
        icon: <FaBriefcase size={28} className="text-primary" />,
        label: "Project",
      };
    default:
      return {
        icon: <FaBuilding size={28} className="text-primary" />,
        label: "Full-Time Job",
      };
  }
};

/* ─── Page ────────────────────────────────────────────────────── */

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let job;
  try {
    job = await getJobByJobId(id);
  } catch {
    notFound();
  }

  const isProject = job.workType === "project";
  const statusBadge = getStatusBadge(job.status);
  const locationInfo = getLocationIcon(job.locationType);
  const workTypeInfo = getWorkTypeIcon(job.workType);

  const companyTypeLabel =
    job.companyType === "individual" ? "Individual" : "Company";

  return (
    <div className="w-full max-w-xl p-2 space-y-4">
      <BackButton title="Job Details" />

      {/* Job Header */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium tracking-wide">
            Job ID: #{job.jobId}
          </p>
          <div
            className={`flex h-7 items-center justify-center px-3 rounded-full ${statusBadge.bg} border ${statusBadge.border}`}
          >
            <span
              className={`${statusBadge.text} text-xs font-bold uppercase tracking-wider`}
            >
              {job.status}
            </span>
          </div>
        </div>

        <h1 className="text-gray-900 dark:text-white text-[28px] font-bold leading-[1.2] mb-1">
          {job.title}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-base font-medium mb-3">
          {job.clientName} · {companyTypeLabel}
        </p>

        {(isProject ? job.budget : job.salary) && (
          <div className="flex items-baseline gap-2 mb-4">
            <h2 className="text-primary text-[26px] font-bold tracking-tight truncate max-w-full">
              {isProject ? job.budget : job.salary}
            </h2>
            {isProject && job.duration && (
              <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                ({job.duration})
              </span>
            )}
          </div>
        )}
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-2 justify-center items-center">
          <CardHeader className="justify-center p-1">
            {workTypeInfo.icon}
          </CardHeader>
          <p className="text-sm text-center">{workTypeInfo.label}</p>
        </Card>
        <Card className="p-2 justify-center items-center">
          <CardHeader className="justify-center p-1">
            {locationInfo.icon}
          </CardHeader>
          <p className="text-sm text-center">{locationInfo.label}</p>
        </Card>
        <Card className="p-2 justify-center items-center">
          <CardHeader className="justify-center p-1">
            <FaClock size={30} className="text-primary" />
          </CardHeader>
          <p className="text-sm text-center">{job.timing}</p>
        </Card>
      </div>

      {/* Qualification / Brief Note */}
      {(job.requiredQualification || job.brief) && (
        <div className="my-4">
          <div className="flex gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/30 p-2 rounded-lg">
            <LuNotebookText
              className="text-amber-600 dark:text-amber-400 shrink-0"
              size={35}
            />
            <div className="flex flex-col justify-center">
              <p className="text-md font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wide mb-0.5">
                {isProject ? "Project Brief" : "Required Qualification"}
              </p>
              <p className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed font-medium">
                {isProject ? job.brief : job.requiredQualification}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Job Details Card */}
      <Card className="w-full p-4">
        <CardHeader className="p-0">
          <FaUserAlt size={24} className="text-primary inline-block mr-2" />
          <h3 className="text-lg font-bold">Job Details</h3>
        </CardHeader>
        <div className="mt-3 px-3 space-y-3">
          {job.experience && (
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-700 pb-2">
              <span className="text-gray-500 dark:text-gray-400 text-sm">
                Experience
              </span>
              <span className="text-gray-900 dark:text-white font-medium text-sm text-right">
                {job.experience}
              </span>
            </div>
          )}
          <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-700 pb-2">
            <span className="text-gray-500 dark:text-gray-400 text-sm">
              Gender
            </span>
            <span className="text-gray-900 dark:text-white font-medium text-sm text-right capitalize">
              {job.gender === "all" || job.gender === "both"
                ? "All genders"
                : `${job.gender} only`}
            </span>
          </div>
          <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-700 pb-2">
            <span className="text-gray-500 dark:text-gray-400 text-sm">
              Working Hours
            </span>
            <span className="text-gray-900 dark:text-white font-medium text-sm text-right">
              {job.timing}
            </span>
          </div>
          {isProject && job.projectType && (
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-700 pb-2">
              <span className="text-gray-500 dark:text-gray-400 text-sm">
                Project Type
              </span>
              <span className="text-gray-900 dark:text-white font-medium text-sm text-right capitalize">
                {job.projectType}
              </span>
            </div>
          )}
        </div>
      </Card>

      {/* Location Card */}
      <Card className="w-full p-4">
        <CardHeader className="p-0">
          <FaMapMarkerAlt
            size={28}
            className="text-primary inline-block mr-2"
          />
          <h3 className="text-lg font-bold">Location</h3>
        </CardHeader>
        <p className="mt-3 px-3 text-md font-medium text-slate-600 dark:text-slate-100 leading-snug">
          {job.location}
        </p>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4 max-w-xl mx-auto z-10">
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
}

"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Avatar } from "@heroui/avatar";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Tab, Tabs } from "@heroui/tabs";
import { Chip } from "@heroui/chip";
import { Spinner } from "@heroui/spinner";
import { LuNotebookPen } from "react-icons/lu";
import { FcPrivacy } from "react-icons/fc";
import { FaLocationDot } from "react-icons/fa6";
import {
  FaBook,
  FaChalkboardTeacher,
  FaMailBulk,
  FaPhone,
} from "react-icons/fa";
import { ShieldCheck, IdCard as IdCardIcon } from "lucide-react";
import BackButton from "@/components/BackButton";
import ButtonGroup from "@/components/ButtonGroup";
import Stack from "@/components/reactbits/ui/Stack";
import {
  IdCard,
  UpgradeCandidateCard,
  type IdCardData,
} from "@/components/teacher/profile/IdCardView";

// ── Types ───────────────────────────────────────────────────────────

interface ProfileData {
  username: string;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  location: string | null;
  websiteUrl: string | null;
  subjects: string[];
  experience: number | null;
  phone: string | null;
  whatsapp: string | null;
  address: string | null;
  teachingExp: string | null;
  jobExp: string | null;
  qualification: string | null;
  board: string | null;
}

interface UserData {
  role: string;
  plan: {
    current: string;
    hasTuitionAccess: boolean;
    hasCandidateAccess: boolean;
    activatedAt: string | null;
  };
  onboardingCompleted: boolean;
  memberSince: string;
}

// ── Page ────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  const { user: clerkUser } = useUser();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isOwnProfile =
    clerkUser?.username?.toLowerCase() === username?.toLowerCase();

  useEffect(() => {
    if (!username) return;

    fetch(`/api/v1/users/${encodeURIComponent(username)}`)
      .then(async (res) => {
        if (!res.ok) {
          const d = await res.json().catch(() => ({}));
          throw new Error(
            (d as { error?: string }).error ?? "Failed to load profile",
          );
        }
        return res.json();
      })
      .then(
        (data: { profile: ProfileData; user: UserData }) => {
          setProfile(data.profile);
          setUserData(data.user);
        },
      )
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Something went wrong"),
      )
      .finally(() => setLoading(false));
  }, [username]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !profile || !userData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-2">
        <p className="text-lg font-semibold text-danger">
          {error ?? "User not found"}
        </p>
      </div>
    );
  }

  // ── Derived data ──────────────────────────────────────────────────

  const displayName = profile.displayName ?? profile.username;
  const avatarUrl =
    profile.avatarUrl ?? clerkUser?.imageUrl ?? undefined;
  const email =
    clerkUser?.primaryEmailAddress?.emailAddress ?? undefined;
  const phone = profile.phone ? `+91 ${profile.phone}` : null;
  const memberSince = new Date(userData.memberSince);
  const joinMonth = memberSince.toLocaleDateString("en-IN", {
    month: "short",
    year: "numeric",
  });

  const isCandidate = userData.plan.hasCandidateAccess;

  // Build IdCard data
  const teacherCardData: IdCardData = {
    role: "teacher",
    name: displayName,
    photo: avatarUrl ?? "/AOTF.svg",
    designation: profile.qualification
      ? `${profile.qualification} Educator`
      : "Educator",
    qualification: profile.qualification ?? undefined,
    subjects: profile.subjects,
    employeeId: `AOTF-T-${profile.username.toUpperCase()}`,
    phone: phone ?? "—",
    email: email ?? "—",
    address: profile.address ?? "—",
    joinDate: joinMonth,
    expiryDate: "—",
    isVerified: userData.onboardingCompleted,
    uniqId: `AOTF-T-${profile.username.toUpperCase()}`,
  };

  const candidateCardData: IdCardData = {
    role: "candidate",
    name: displayName,
    photo: avatarUrl ?? "/AOTF.svg",
    designation: "Aspiring Educator",
    qualification: profile.qualification ?? undefined,
    subjects: profile.subjects,
    employeeId: `AOTF-C-${profile.username.toUpperCase()}`,
    phone: phone ?? "—",
    email: email ?? "—",
    address: profile.address ?? "—",
    joinDate: joinMonth,
    expiryDate: "—",
    isVerified: userData.onboardingCompleted,
    uniqId: `AOTF-C-${profile.username.toUpperCase()}`,
  };

  const actionItems = [
    {
      icon: <FcPrivacy size={22} />,
      title: "Privacy Policy",
      link: "/privacy-policy",
    },
    {
      icon: <FcPrivacy size={22} />,
      title: "Refund Policy",
      link: "/refund-policy",
    },
    {
      icon: <FcPrivacy size={22} />,
      title: "Terms & Conditions",
      link: "/terms",
    },
  ];

  return (
    <div className="w-full">
      <BackButton title="Profile" />

      {/* ── Profile Header ─────────────────────────────────────── */}
      <div className="md:flex justify-between items-center max-w-3xl mx-auto">
        <div className="flex flex-row items-center justify-start gap-4 py-4">
          <Avatar
            className="w-20 h-20 text-large"
            src={avatarUrl}
            name={displayName}
          />
          <div className="flex flex-col items-start gap-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold">{displayName}</h1>
              {userData.onboardingCompleted && (
                <ShieldCheck className="text-green-500" size={18} />
              )}
            </div>
            <div className="flex gap-1">
              <p className="text-sm text-gray-500">
                {profile.bio ?? "A passionate educator and lifelong learner."}
              </p>
            </div>
            {profile.location && (
              <div className="flex items-center gap-1">
                <FaLocationDot />
                <p className="text-sm text-gray-500">{profile.location}</p>
              </div>
            )}
            {profile.address && !profile.location && (
              <div className="flex items-center gap-1">
                <FaLocationDot />
                <p className="text-sm text-gray-500">{profile.address}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Tabs ───────────────────────────────────────────────── */}
      <div className="flex w-full flex-col items-center">
        <Tabs
          aria-label="Options"
          color="primary"
          variant="bordered"
          radius="full"
        >
          {/* ── Profile Tab ── */}
          <Tab
            key="profile"
            title={
              <div className="flex items-center space-x-2">
                <LuNotebookPen size={20} className="font-bold" />
                <span>Profile</span>
              </div>
            }
          >
            <div className="space-y-2">
              {/* Qualification */}
              {profile.qualification && (
                <Card className="p-4 max-w-lg mx-auto">
                  <CardHeader className="flex items-center gap-2 p-0">
                    <FaBook className="text-primary" />
                    <h3 className="text-lg font-bold">
                      Education &amp; Qualification
                    </h3>
                  </CardHeader>
                  <CardBody className="space-y-3 p-2">
                    <div className="flex gap-4">
                      <div className="shrink-0 w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <FaBook className="text-slate-500" />
                      </div>
                      <div>
                        <p className="font-bold text-sm">
                          {profile.qualification}
                        </p>
                        {profile.board && (
                          <p className="text-xs text-[#4c6c9a] dark:text-slate-400">
                            Board: {profile.board}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardBody>
                </Card>
              )}

              {/* Contact */}
              {isOwnProfile && (phone || email) && (
                <Card className="p-4 max-w-lg mx-auto">
                  <CardHeader className="flex items-center gap-2 p-0">
                    <FaChalkboardTeacher className="text-primary" />
                    <h3 className="text-lg font-bold">Contact Details</h3>
                  </CardHeader>
                  <CardBody className="space-y-3 p-2">
                    {email && (
                      <div className="flex gap-4">
                        <div className="shrink-0 w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                          <FaMailBulk className="text-slate-500" />
                        </div>
                        <div>
                          <p className="text-xs text-[#4c6c9a] dark:text-slate-400">
                            Email Id:
                          </p>
                          <p className="font-bold text-sm">{email}</p>
                        </div>
                      </div>
                    )}
                    {phone && (
                      <div className="flex gap-4">
                        <div className="shrink-0 w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                          <FaPhone className="text-slate-500" />
                        </div>
                        <div>
                          <p className="text-xs text-[#4c6c9a] dark:text-slate-400">
                            Phone Number:
                          </p>
                          <p className="font-bold text-sm">{phone}</p>
                        </div>
                      </div>
                    )}
                  </CardBody>
                </Card>
              )}

              {/* Professional Details */}
              <ProfessionalDetailsCard
                qualification={profile.qualification}
                schoolBoard={profile.board}
                subjects={profile.subjects}
                teachingExp={profile.teachingExp}
                jobExp={profile.jobExp}
              />
            </div>
          </Tab>

          {/* ── ID Card Tab ── */}
          <Tab
            key="idcard"
            title={
              <div className="flex items-center space-x-2">
                <IdCardIcon size={20} className="font-bold" />
                <span>Id Card</span>
              </div>
            }
          >
            <div className="max-w-sm mx-auto space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FaChalkboardTeacher className="text-indigo-500" />
                  <h3 className="text-lg font-bold text-default-900">
                    {isOwnProfile ? "Your ID Cards" : `${displayName}'s ID`}
                  </h3>
                </div>
                <Chip
                  size="sm"
                  variant="flat"
                  color={isCandidate ? "success" : "primary"}
                  className="text-[10px] uppercase font-semibold"
                >
                  {userData.plan.current === "teacher_candidate"
                    ? "Teacher & Candidate"
                    : "Teacher"}{" "}
                  plan
                </Chip>
              </div>

              <div className="mx-auto" style={{ width: 340, height: 540 }}>
                <Stack
                  randomRotation={false}
                  sensitivity={180}
                  sendToBackOnClick
                  mobileClickOnly
                  cards={[
                    <IdCard key="teacher" data={teacherCardData} />,
                    isCandidate ? (
                      <IdCard key="candidate" data={candidateCardData} />
                    ) : (
                      <UpgradeCandidateCard key="upgrade" />
                    ),
                  ]}
                  pauseOnHover
                />
              </div>

              <p className="text-center text-xs text-default-400">
                Swipe or tap to switch cards &nbsp;↻
              </p>
            </div>
          </Tab>
        </Tabs>
      </div>

      {/* ── Action Buttons ─────────────────────────────────────── */}
      {isOwnProfile && (
        <div className="w-full mb-8">
          <ButtonGroup items={actionItems} className="px-auto mx-auto" />
        </div>
      )}
    </div>
  );
}

// ── Professional Details Card ──────────────────────────────────────

function ProfessionalDetailsCard({
  qualification,
  schoolBoard,
  subjects,
  teachingExp,
  jobExp,
}: {
  qualification: string | null;
  schoolBoard: string | null;
  subjects: string[];
  teachingExp: string | null;
  jobExp: string | null;
}) {
  const hasContent = qualification || schoolBoard || subjects.length > 0 || teachingExp;
  if (!hasContent) return null;

  return (
    <Card className="p-4 max-w-lg mx-auto">
      <CardBody className="p-0">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Professional Details</h3>
        </div>

        <div className="flex flex-col gap-3">
          {/* Qualification */}
          {qualification && (
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
          )}

          {/* School Board */}
          {schoolBoard && (
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
          )}

          {/* Teaching Experience */}
          {teachingExp && (
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                📡
              </div>
              <div>
                <p className="text-xs text-[#4c6c9a] dark:text-slate-400">
                  Teaching Experience
                </p>
                <p className="font-bold text-sm">{teachingExp} years</p>
              </div>
            </div>
          )}

          {/* Job Experience */}
          {jobExp && (
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                💼
              </div>
              <div>
                <p className="text-xs text-[#4c6c9a] dark:text-slate-400">
                  Job Experience
                </p>
                <p className="font-bold text-sm">{jobExp} years</p>
              </div>
            </div>
          )}

          {/* Subjects */}
          {subjects.length > 0 && (
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                🔬
              </div>
              <div>
                <p className="text-xs text-[#4c6c9a] dark:text-slate-400">
                  Skills
                </p>
                <div className="flex flex-wrap gap-2">
                  {subjects.map((s) => (
                    <Chip
                      size="sm"
                      key={s}
                      variant="shadow"
                      className="font-bold text-sm"
                    >
                      {s}
                    </Chip>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
}

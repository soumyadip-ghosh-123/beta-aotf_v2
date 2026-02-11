"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Select, SelectItem } from "@heroui/select";
import { DateRangePicker } from "@heroui/date-picker";
import { Button } from "@heroui/button";
import { Divider } from "@heroui/divider";
import { Card, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Input } from "@heroui/input";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/modal";
import {
  TuitionPostCard,
  TuitionPost,
} from "@/components/admin/postcards/TuitionPostCard";
import { Calendar, Filter, X, Search, AlertTriangle } from "lucide-react";

// Sample data - replace with actual API call
const samplePosts: TuitionPost[] = [
  {
    id: "P-05022600",
    title: "All Subjects - Class 9",
    subtitle: "WB-English Version • Rajabazar, Sealdah",
    guardian: "MD Faiyaz uddin",
    guardianPhone: "8910222010",
    className: "9",
    subject: "All Subjects",
    board: "WB-English Version",
    location: "Rajabazar, Sealdah",
    budget: 3000,
    classType: "in-person",
    frequency: "four",
    preferredDays: [],
    notes: "",
    status: "open",
    type: "post",
    applicantCount: 6,
    applicationStats: {
      pending: 6,
      DC: 0,
      GC: 0,
      approved: 0,
      declined: 0,
      withdrawn: 0,
      total: 6,
    },
  },
  {
    id: "P-05022601",
    title: "Mathematics - Class 10",
    subtitle: "CBSE Board • Salt Lake",
    guardian: "Priya Sharma",
    guardianPhone: "9876543210",
    className: "10",
    subject: "Mathematics",
    board: "CBSE",
    location: "Salt Lake, Sector V",
    budget: 5000,
    classType: "online",
    frequency: "three",
    preferredDays: ["Monday", "Wednesday", "Friday"],
    notes: "Need experienced teacher for board exam preparation",
    status: "open",
    type: "post",
    applicantCount: 12,
    applicationStats: {
      pending: 8,
      DC: 0,
      GC: 0,
      approved: 3,
      declined: 1,
      withdrawn: 0,
      total: 12,
    },
  },
  {
    id: "P-04022600",
    title: "Science - Class 8",
    subtitle: "ICSE Board • Park Street",
    guardian: "Rajesh Kumar",
    guardianPhone: "9123456789",
    className: "8",
    subject: "Science",
    board: "ICSE",
    location: "Park Street, Central Kolkata",
    budget: 4000,
    classType: "in-person",
    frequency: "five",
    preferredDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    notes: "Prefer female teacher",
    status: "filled",
    type: "post",
    applicantCount: 8,
    applicationStats: {
      pending: 0,
      DC: 0,
      GC: 0,
      approved: 1,
      declined: 6,
      withdrawn: 0,
      total: 8,
    },
  },
];

const Page = () => {
  const router = useRouter();
  const currentYear = 2026;
  const currentMonth = 2; // February
  const currentDay = 10;

  // Generate years (last 5 years)
  const years = useMemo(
    () =>
      Array.from({ length: 5 }, (_, i) => {
        const year = currentYear - i;
        return { key: year.toString(), label: year.toString() };
      }),
    []
  );

  // Generate months
  const months = [
    { key: "1", label: "January" },
    { key: "2", label: "February" },
    { key: "3", label: "March" },
    { key: "4", label: "April" },
    { key: "5", label: "May" },
    { key: "6", label: "June" },
    { key: "7", label: "July" },
    { key: "8", label: "August" },
    { key: "9", label: "September" },
    { key: "10", label: "October" },
    { key: "11", label: "November" },
    { key: "12", label: "December" },
  ];

  // Generate days (1-31)
  const days = useMemo(
    () =>
      Array.from({ length: 31 }, (_, i) => {
        const day = i + 1;
        return { key: day.toString(), label: day.toString() };
      }),
    []
  );
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [selectedDay, setSelectedDay] = useState<string>("");
  const [dateRange, setDateRange] = useState<any>(null);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [postToCancel, setPostToCancel] = useState<TuitionPost | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Filter posts based on selected filters
  const filteredPosts = useMemo(() => {
    let filtered = [...samplePosts];

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((post) => {
        return (
          post.id.toLowerCase().includes(query) ||
          post.title.toLowerCase().includes(query) ||
          post.guardian.toLowerCase().includes(query) ||
          post.guardianPhone.includes(query) ||
          post.className.toLowerCase().includes(query) ||
          post.subject.toLowerCase().includes(query) ||
          post.board.toLowerCase().includes(query) ||
          post.location.toLowerCase().includes(query) ||
          post.status.toLowerCase().includes(query)
        );
      });
    }

    // Filter by dropdown selection (year, month, day)
    if (selectedYear || selectedMonth || selectedDay) {
      filtered = filtered.filter((post) => {
        // Extract date from post ID (format: P-DDMMYY00)
        const dateStr = post.id.split("-")[1];
        const day = parseInt(dateStr.substring(0, 2));
        const month = parseInt(dateStr.substring(2, 4));
        const year = 2000 + parseInt(dateStr.substring(4, 6));

        const matchYear = !selectedYear || year === parseInt(selectedYear);
        const matchMonth = !selectedMonth || month === parseInt(selectedMonth);
        const matchDay = !selectedDay || day === parseInt(selectedDay);

        return matchYear && matchMonth && matchDay;
      });
    }

    // Filter by date range
    if (dateRange?.start && dateRange?.end) {
      filtered = filtered.filter((post) => {
        const dateStr = post.id.split("-")[1];
        const day = parseInt(dateStr.substring(0, 2));
        const month = parseInt(dateStr.substring(2, 4));
        const year = 2000 + parseInt(dateStr.substring(4, 6));

        const postDate = new Date(year, month - 1, day);
        const startDate = new Date(
          dateRange.start.year,
          dateRange.start.month - 1,
          dateRange.start.day
        );
        const endDate = new Date(
          dateRange.end.year,
          dateRange.end.month - 1,
          dateRange.end.day
        );

        return postDate >= startDate && postDate <= endDate;
      });
    }
    return filtered;
  }, [selectedYear, selectedMonth, selectedDay, dateRange, searchQuery]);

  const handleClearFilters = () => {
    setSelectedYear("");
    setSelectedMonth("");
    setSelectedDay("");
    setDateRange(null);
  };
  const handleShare = (post: TuitionPost) => {
    console.log("Share post:", post.id);
    // Implement share functionality
  };

  const handleCancel = (post: TuitionPost) => {
    setPostToCancel(post);
    onOpen();
  };
  const confirmCancel = () => {
    if (postToCancel) {
      console.log("Cancelling post:", postToCancel.id);
      // Implement actual cancel functionality here
      // For example: call API to cancel the post
      // await cancelPost(postToCancel.id);
    }
    onClose();
    setPostToCancel(null);
  };
  const handleView = (post: TuitionPost) => {
    router.push(`/admin/tuitions/${post.id}`);
  };

  const handleEdit = (post: TuitionPost) => {
    router.push(`/admin/tuitions/${post.id}/edit`);
  };

  const hasActiveFilters =
    selectedYear || selectedMonth || selectedDay || dateRange;
  return (
    <div className="container mx-auto px-4 w-full max-w-7xl">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-default-900">
            Tuition Posts Management
          </h1>
          <p className="text-default-500">
            Filter and manage all tuition posts
          </p>
        </div>

        <div className="flex gap-2">
          {/* Search Section */}
          <Input
            placeholder="Search by Anything"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            startContent={<Search size={18} className="text-default-400" />}
            endContent={
              searchQuery && (
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  onPress={() => setSearchQuery("")}
                >
                  <X size={16} />
                </Button>
              )
            }
          />
          {/* Filter Toggle Button */}
          <Button
            isIconOnly
            variant={showFilters ? "solid" : "bordered"}
            color={showFilters ? "primary" : "default"}
            startContent={<Filter size={18} />}
            onPress={() => setShowFilters(!showFilters)}
          ></Button>
        </div>

        {/* Filters Section - Collapsible */}
        {showFilters && (
          <Card>
            <CardBody className="gap-6">
              {/* Dropdown Filters */}
              <div className="space-y-4">
                <div className="flex justify-between items-center gap-2">
                  <div className="flex items-center gap-2">
                    <Calendar size={18} className="text-default-400" />
                    <p className="text-sm font-medium text-default-700">
                      Filter by Date
                    </p>
                  </div>
                  {hasActiveFilters && (
                    <Button
                      size="sm"
                      color="danger"
                      variant="flat"
                      startContent={<X size={16} />}
                      onPress={handleClearFilters}
                    >
                      Clear Filters
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Select
                    label="Year"
                    placeholder="Select year"
                    selectedKeys={selectedYear ? [selectedYear] : []}
                    onSelectionChange={(keys) => {
                      const key = Array.from(keys)[0] as string;
                      setSelectedYear(key || "");
                    }}
                    variant="bordered"
                  >
                    {years.map((year) => (
                      <SelectItem key={year.key}>{year.label}</SelectItem>
                    ))}
                  </Select>

                  <Select
                    label="Month"
                    placeholder="Select month"
                    selectedKeys={selectedMonth ? [selectedMonth] : []}
                    onSelectionChange={(keys) => {
                      const key = Array.from(keys)[0] as string;
                      setSelectedMonth(key || "");
                    }}
                    variant="bordered"
                  >
                    {months.map((month) => (
                      <SelectItem key={month.key}>{month.label}</SelectItem>
                    ))}
                  </Select>

                  <Select
                    label="Day"
                    placeholder="Select day"
                    selectedKeys={selectedDay ? [selectedDay] : []}
                    onSelectionChange={(keys) => {
                      const key = Array.from(keys)[0] as string;
                      setSelectedDay(key || "");
                    }}
                    variant="bordered"
                  >
                    {days.map((day) => (
                      <SelectItem key={day.key}>{day.label}</SelectItem>
                    ))}
                  </Select>
                </div>
              </div>

              <Divider />

              {/* Date Range Picker */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Calendar size={18} className="text-default-400" />
                  <p className="text-sm font-medium text-default-700">
                    Or select a date range
                  </p>
                </div>
                <DateRangePicker
                  label="Date Range"
                  variant="bordered"
                  value={dateRange}
                  onChange={setDateRange}
                  className="max-w-full"
                />
              </div>
            </CardBody>
          </Card>
        )}
        {/* Results Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-default-700">
              Posts{" "}
              <span className="text-default-400">
                ({filteredPosts.length} results)
              </span>
            </h2>
          </div>

          {filteredPosts.length === 0 ? (
            <Card>
              <CardBody className="py-12 text-center">
                <p className="text-default-400">
                  No posts found matching your filters
                </p>
              </CardBody>
            </Card>
          ) : (            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map((post) => (
                <TuitionPostCard
                  key={post.id}
                  post={post}
                  onShare={handleShare}
                  onCancel={handleCancel}
                  onView={handleView}
                  onEdit={handleEdit}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="md">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={24} className="text-danger" />
                  <span>Cancel Post Confirmation</span>
                </div>
              </ModalHeader>
              <ModalBody>
                <p className="text-default-600">
                  Are you sure you want to cancel this post?
                </p>
                {postToCancel && (
                  <Card className="mt-2">
                    <CardBody className="gap-2">
                      <p className="text-sm">
                        <span className="font-semibold">Post ID:</span>{" "}
                        <span className="text-primary">{postToCancel.id}</span>
                      </p>
                      <p className="text-sm">
                        <span className="font-semibold">Title:</span>{" "}
                        {postToCancel.title}
                      </p>
                      <p className="text-sm">
                        <span className="font-semibold">Guardian:</span>{" "}
                        {postToCancel.guardian}
                      </p>
                      <p className="text-sm">
                        <span className="font-semibold">Status:</span>{" "}
                        <Chip
                          size="sm"
                          color={
                            postToCancel.status === "open"
                              ? "success"
                              : postToCancel.status === "filled"
                                ? "warning"
                                : "danger"
                          }
                          variant="flat"
                          className="capitalize"
                        >
                          {postToCancel.status}
                        </Chip>
                      </p>
                    </CardBody>
                  </Card>
                )}
                <p className="text-sm text-danger-500 mt-2">
                  This action cannot be undone. The post will be marked as
                  cancelled and teachers will no longer be able to apply.
                </p>
              </ModalBody>
              <ModalFooter>
                <Button color="default" variant="light" onPress={onClose}>
                  No, Keep Post
                </Button>
                <Button color="danger" onPress={confirmCancel}>
                  Yes, Cancel Post
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default Page;

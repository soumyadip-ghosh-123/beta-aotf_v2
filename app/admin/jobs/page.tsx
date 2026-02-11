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
import { JobPostCard, JobPost } from "@/components/admin/postcards/JobPostCard";
import { Calendar, Filter, X, Search, AlertTriangle } from "lucide-react";

// Sample data - replace with actual API call
const samplePosts: JobPost[] = [
  {
    id: "J-05022600",
    title: "Software Engineer",
    company: "Tech Solutions Pvt Ltd",
    companyPhone: "9876543210",
    designation: "Senior Software Engineer",
    experience: "3-5 years",
    location: "Salt Lake, Kolkata",
    salary: "₹8-12 LPA",
    jobType: "Full-time",
    locationType: "Hybrid",
    timing: "10:00 AM - 7:00 PM",
    qualification: "B.Tech/M.Tech in Computer Science",
    status: "open",
    type: "job",
    applicantCount: 15,
    applicationStats: {
      pending: 12,
      approved: 2,
      declined: 1,
      withdrawn: 0,
      total: 15,
    },
    postedDate: "2026-02-05",
  },
  {
    id: "J-04022600",
    title: "Marketing Manager",
    company: "Digital Marketing Hub",
    companyPhone: "9123456789",
    designation: "Marketing Manager",
    experience: "5+ years",
    location: "Park Street, Kolkata",
    salary: "₹10-15 LPA",
    jobType: "Full-time",
    locationType: "On-site",
    timing: "9:00 AM - 6:00 PM",
    qualification: "MBA in Marketing",
    status: "open",
    type: "job",
    applicantCount: 8,
    applicationStats: {
      pending: 5,
      approved: 1,
      declined: 2,
      withdrawn: 0,
      total: 8,
    },
    postedDate: "2026-02-04",
  },
  {
    id: "J-03022600",
    title: "Data Analyst",
    company: "Analytics Pro",
    companyPhone: "9998887776",
    designation: "Senior Data Analyst",
    experience: "2-4 years",
    location: "New Town, Kolkata",
    salary: "₹6-9 LPA",
    jobType: "Full-time",
    locationType: "Remote",
    timing: "Flexible",
    qualification: "B.Sc/M.Sc in Statistics or related field",
    status: "filled",
    type: "job",
    applicantCount: 20,
    applicationStats: {
      pending: 0,
      approved: 1,
      declined: 18,
      withdrawn: 1,
      total: 20,
    },
    postedDate: "2026-02-03",
  },
];

const Page = () => {
  const router = useRouter();
  const currentYear = 2026;
  const currentMonth = 2; // February

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
  const [postToCancel, setPostToCancel] = useState<JobPost | null>(null);
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
          post.company.toLowerCase().includes(query) ||
          post.designation.toLowerCase().includes(query) ||
          post.location.toLowerCase().includes(query) ||
          post.jobType.toLowerCase().includes(query) ||
          post.status.toLowerCase().includes(query)
        );
      });
    }

    // Filter by dropdown selection (year, month, day)
    if (selectedYear || selectedMonth || selectedDay) {
      filtered = filtered.filter((post) => {
        // Extract date from post ID (format: J-DDMMYY00)
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

  const handleShare = (post: JobPost) => {
    console.log("Share post:", post.id);
    // Implement share functionality
  };

  const handleCancel = (post: JobPost) => {
    setPostToCancel(post);
    onOpen();
  };

  const confirmCancel = () => {
    if (postToCancel) {
      console.log("Cancelling post:", postToCancel.id);
      // Implement actual cancel functionality here
    }
    onClose();
    setPostToCancel(null);
  };

  const handleView = (post: JobPost) => {
    router.push(`/admin/jobs/${post.id}`);
  };

  const handleEdit = (post: JobPost) => {
    router.push(`/admin/jobs/${post.id}/edit`);
  };

  const hasActiveFilters =
    selectedYear || selectedMonth || selectedDay || dateRange;

  return (
    <div className="container mx-auto px-4 w-full max-w-7xl">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-default-900">
            Job Posts Management
          </h1>
          <p className="text-default-500">Filter and manage all job posts</p>
        </div>

        {/* Search Bar */}
        <div className="flex gap-2">
          <Input
            placeholder="Search by Anything"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            startContent={<Search size={18} className="text-default-400" />}
            endContent={
              searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-default-400 hover:text-default-600"
                >
                  <X size={18} />
                </button>
              )
            }
          />
          <Button
            isIconOnly
            variant={showFilters ? "solid" : "bordered"}
            color={showFilters ? "primary" : "default"}
            startContent={<Filter size={18} />}
            onPress={() => setShowFilters(!showFilters)}
          ></Button>
        </div>

        {/* Collapsible Filter Section */}
        {showFilters && (
          <Card>
            <CardBody className="gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-default-900">
                  Filter Job Posts
                </h3>
                {hasActiveFilters && (
                  <Button
                    size="sm"
                    variant="flat"
                    color="danger"
                    startContent={<X size={16} />}
                    onPress={handleClearFilters}
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
              <Divider /> {/* Date Filters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Select
                  label="Year"
                  placeholder="Select year"
                  selectedKeys={selectedYear ? [selectedYear] : []}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  startContent={<Calendar size={18} />}
                >
                  {years.map((year) => (
                    <SelectItem key={year.key}>{year.label}</SelectItem>
                  ))}
                </Select>

                <Select
                  label="Month"
                  placeholder="Select month"
                  selectedKeys={selectedMonth ? [selectedMonth] : []}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  startContent={<Calendar size={18} />}
                >
                  {months.map((month) => (
                    <SelectItem key={month.key}>{month.label}</SelectItem>
                  ))}
                </Select>

                <Select
                  label="Day"
                  placeholder="Select day"
                  selectedKeys={selectedDay ? [selectedDay] : []}
                  onChange={(e) => setSelectedDay(e.target.value)}
                  startContent={<Calendar size={18} />}
                >
                  {days.map((day) => (
                    <SelectItem key={day.key}>{day.label}</SelectItem>
                  ))}
                </Select>
              </div>
              <Divider />
              {/* Date Range Picker */}
              <div>
                <label className="text-sm font-medium text-default-700 mb-2 block">
                  Or select a date range
                </label>
                <DateRangePicker
                  label="Date Range"
                  value={dateRange}
                  onChange={setDateRange}
                  className="w-full"
                />
              </div>
            </CardBody>
          </Card>
        )}

        {/* Results Counter */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-default-500">
            Showing{" "}
            <span className="font-semibold text-default-900">
              {filteredPosts.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-default-900">
              {samplePosts.length}
            </span>{" "}
            job posts
          </p>
        </div>

        {/* Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">          {filteredPosts.map((post) => (
            <JobPostCard
              key={post.id}
              post={post}
              onShare={handleShare}
              onCancel={handleCancel}
              onView={handleView}
              onEdit={handleEdit}
            />
          ))}
        </div>

        {/* No Results */}
        {filteredPosts.length === 0 && (
          <Card>
            <CardBody className="py-10 text-center">
              <p className="text-default-500">
                No job posts found matching your filters
              </p>
            </CardBody>
          </Card>
        )}
      </div>

      {/* Cancel Confirmation Modal */}
      <Modal isOpen={isOpen} onClose={onClose} placement="center">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="text-warning" size={24} />
                  <span>Cancel Job Post</span>
                </div>
              </ModalHeader>
              <ModalBody>
                <p className="text-default-600">
                  Are you sure you want to cancel this job post?
                </p>
                {postToCancel && (
                  <Card className="bg-default-100">
                    <CardBody className="gap-2">
                      <p className="text-sm">
                        <span className="font-semibold">Post ID:</span>{" "}
                        {postToCancel.id}
                      </p>
                      <p className="text-sm">
                        <span className="font-semibold">Designation:</span>{" "}
                        {postToCancel.designation}
                      </p>
                      <p className="text-sm">
                        <span className="font-semibold">Company:</span>{" "}
                        {postToCancel.company}
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
                  cancelled and candidates will no longer be able to apply.
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

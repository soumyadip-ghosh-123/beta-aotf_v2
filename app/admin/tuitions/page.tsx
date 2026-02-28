"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Spinner } from "@heroui/spinner";
import AdminSearchBar, {
  FilterConfig,
} from "@/components/admin/ui/AdminSearchBar";
import DateChips from "@/components/admin/ui/DateChips";
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
import { AlertTriangle, Plus } from "lucide-react";
/** Map a DB post (from API) to the TuitionPost interface used by the card. */
function mapApiPost(p: Record<string, any>): TuitionPost {
  return {
    id: p.postId,
    guardian: p.guardianName,
    guardianPhone: p.guardianPhone,
    students: (p.students ?? []).map((s: any) => ({
      className: s.className,
      board: s.board,
      subjects: s.subjects ?? [],
      subjectsNormalized: s.subjectsNormalized,
    })),
    location: p.location,
    budget: p.monthlyBudget ?? 0,
    classType: p.classType,
    frequency: p.frequencyPerWeek ?? 0,
    preferredDays: p.preferredDays ?? [],
    preferredTime: p.preferredTime,
    notes: p.notes ?? "",
    status: p.status ?? "open",
    type: "post",
    // Applicant data will come from the applications collection later
    applicantCount: 0,
    applicationStats: {
      pending: 0,
      DC: 0,
      GC: 0,
      approved: 0,
      declined: 0,
      withdrawn: 0,
      total: 0,
    },
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  };
}

const Page = () => {
  const router = useRouter();
  const currentYear = new Date().getFullYear();

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

  const [selectedYear, setSelectedYear] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [selectedDay, setSelectedDay] = useState<string>("");  const [filterStatus, setFilterStatus] = useState<string>("");
  const [dateRange, setDateRange] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedDateChip, setSelectedDateChip] = useState<string>("");
  const [postToCancel, setPostToCancel] = useState<TuitionPost | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  // ── Data fetching state ──────────────────────────────────────────────
  const [posts, setPosts] = useState<TuitionPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    totalPages: 0,
    limit: 10,
  });

  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const params = new URLSearchParams();
      params.set("limit", pagination.limit.toString());
      if (searchQuery.trim()) params.set("search", searchQuery.trim());
      const res = await fetch(`/api/v1/posts?${params.toString()}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Failed to fetch posts (${res.status})`);
      }
      const data = await res.json();
      const mapped: TuitionPost[] = (data.posts ?? []).map(mapApiPost);
      setPosts(mapped);
      setPagination(
        data.pagination ?? {
          page: 1,
          total: mapped.length,
          totalPages: 1,
          limit: 10,
        }
      );
    } catch (err) {
      setFetchError(
        err instanceof Error ? err.message : "Failed to fetch posts"
      );
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery]);

  // Fetch on mount and when searchQuery changes (debounced)
  useEffect(() => {
    const timer = setTimeout(
      () => {
        fetchPosts();
      },
      searchQuery ? 400 : 0
    ); // debounce search, instant on mount
    return () => clearTimeout(timer);
  }, [fetchPosts, searchQuery]);
  // Client-side date + status filtering on already-fetched posts
  const filteredPosts = useMemo(() => {
    let filtered = [...posts];

    // Filter by status
    if (filterStatus) {
      filtered = filtered.filter((post) => post.status === filterStatus);
    }

    // Filter by dropdown selection (year, month, day) from postId
    if (selectedYear || selectedMonth || selectedDay) {
      filtered = filtered.filter((post) => {
        // Extract date from post ID (format: P-DDMMYYNN)
        const dateStr = post.id.split("-")[1];
        if (!dateStr || dateStr.length < 6) return true;
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
        if (!dateStr || dateStr.length < 6) return true;
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
        );        return postDate >= startDate && postDate <= endDate;
      });
    }

    // Filter by selected date chip (compares against createdAt)
    if (selectedDateChip) {
      filtered = filtered.filter((post) => {
        if (!post.createdAt) return false;
        return post.createdAt.slice(0, 10) === selectedDateChip;
      });
    }

    return filtered;
  }, [posts, selectedYear, selectedMonth, selectedDay, dateRange, filterStatus, selectedDateChip]);
  // Filter configs for AdminSearchBar
  const tuitionFilterConfigs: FilterConfig[] = [
    {
      key: "status",
      label: "Status",
      placeholder: "All Statuses",
      options: [
        { key: "open", label: "Open" },
        { key: "matched", label: "Matched" },
        { key: "closed", label: "Closed" },
        { key: "cancelled", label: "Cancelled" },
        { key: "hold", label: "Hold" },
      ],
    },
    {
      key: "year",
      label: "Year",
      placeholder: "All Years",
      options: Array.from({ length: 5 }, (_, i) => ({
        key: String(currentYear - i),
        label: String(currentYear - i),
      })),
    },
    {
      key: "month",
      label: "Month",
      placeholder: "All Months",
      options: months.map((m) => ({ key: m.key, label: m.label })),
    },
    {
      key: "day",
      label: "Day",
      placeholder: "All Days",
      options: Array.from({ length: 31 }, (_, i) => ({
        key: String(i + 1),
        label: String(i + 1),
      })),
    },
  ];

  const tuitionFilterValues: Record<string, string> = {
    status: filterStatus,
    year: selectedYear,
    month: selectedMonth,
    day: selectedDay,
  };

  const handleFilterChange = (key: string, value: string) => {
    if (key === "status") setFilterStatus(value);
    else if (key === "year") setSelectedYear(value);
    else if (key === "month") setSelectedMonth(value);
    else if (key === "day") setSelectedDay(value);
  };
  const handleClearFilters = () => {
    setFilterStatus("");
    setSelectedYear("");
    setSelectedMonth("");
    setSelectedDay("");
    setDateRange(null);
    setSearchQuery("");
    setSelectedDateChip("");
  };

  const handleShare = (post: TuitionPost) => {
    // Share is handled inside TuitionPostCard — this callback is optional
  };

  const handleCancel = (post: TuitionPost) => {
    setPostToCancel(post);
    onOpen();
  };
  const confirmCancel = async () => {
    if (postToCancel) {
      try {
        const res = await fetch(`/api/v1/posts/${postToCancel.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "cancelled" }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          console.error("Cancel failed:", data.error);
        }
        // Refresh the list after cancelling
        fetchPosts();
      } catch (err) {
        console.error("Cancel error:", err);
      }
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
    selectedYear || selectedMonth || selectedDay || filterStatus || dateRange;
  return (
    <div className="container mx-auto px-4 w-full max-w-7xl">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-default-900">
            Tuition Management
          </h1>
          <Button
            color="primary"
            size="sm"
            startContent={<Plus size={16} />}
            onPress={() => router.push("/admin/tuitions/create")}
          >
            New Post
          </Button>
        </div>

        {/* Centralised Search + Filter Bar */}        <AdminSearchBar
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          placeholder="Search by guardian, location, subject…"
          filters={tuitionFilterConfigs}
          filterValues={tuitionFilterValues}
          onFilterChange={handleFilterChange}
          resultCount={filteredPosts.length}
          resultLabel="post"
          onClearAll={handleClearFilters}
        />

        {/* Date quick-filter chips */}
        <DateChips selected={selectedDateChip} onChange={setSelectedDateChip} />{/* Results Section */}
        <div className="space-y-4">

          {isLoading ? (
            <Card>
              <CardBody className="py-12 flex items-center justify-center">
                <Spinner size="lg" label="Loading posts..." />
              </CardBody>
            </Card>
          ) : fetchError ? (
            <Card>
              <CardBody className="py-12 text-center space-y-3">
                <p className="text-danger">{fetchError}</p>
                <Button
                  size="sm"
                  color="primary"
                  variant="flat"
                  onPress={fetchPosts}
                >
                  Retry
                </Button>
              </CardBody>
            </Card>
          ) : filteredPosts.length === 0 ? (
            <Card>
              <CardBody className="py-12 text-center">
                <p className="text-default-400">
                  No posts found matching your filters
                </p>
              </CardBody>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                        <span className="font-semibold">Guardian:</span>{" "}
                        {postToCancel.guardian}
                      </p>
                      <p className="text-sm">
                        <span className="font-semibold">Location:</span>{" "}
                        {postToCancel.location}
                      </p>
                      <p className="text-sm">
                        <span className="font-semibold">Status:</span>{" "}
                        <Chip
                          size="sm"
                          color={
                            postToCancel.status === "open"
                              ? "success"
                              : postToCancel.status === "matched"
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

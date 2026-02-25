"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Select, SelectItem } from "@heroui/select";
import { Button } from "@heroui/button";
import { Divider } from "@heroui/divider";
import { Card, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Input } from "@heroui/input";
import { Spinner } from "@heroui/spinner";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/modal";
import { JobPostCard, JobPost } from "@/components/admin/postcards/JobPostCard";
import {
  Calendar,
  Filter,
  X,
  Search,
  AlertTriangle,
  Plus,
  RefreshCw,
} from "lucide-react";
import { addToast } from "@heroui/toast";

/** Map a DB job (from API) to the JobPost interface used by the card. */
function mapApiJob(j: Record<string, unknown>): JobPost {
  return {
    id: (j.jobId as string) ?? (j._id as string),
    title: j.title as string,
    workType: j.workType as JobPost["workType"],
    clientName: j.clientName as string,
    phoneNumber: j.phoneNumber as string,
    companyType: j.companyType as JobPost["companyType"],
    locationType: j.locationType as JobPost["locationType"],
    location: j.location as string,
    timing: j.timing as string,
    experience: (j.experience as string) ?? "",
    gender: j.gender as JobPost["gender"],
    salary: (j.salary as string) ?? "",
    requiredQualification: (j.requiredQualification as string) ?? "",
    projectType: j.projectType as JobPost["projectType"],
    budget: (j.budget as string) ?? undefined,
    duration: (j.duration as string) ?? undefined,
    brief: (j.brief as string) ?? undefined,
    status: j.status as JobPost["status"],
    commissionBasis: j.commissionBasis as JobPost["commissionBasis"],
    academyCommissionPercentage: j.academyCommissionPercentage as number,
    applicantCount: 0,
    createdAt: j.createdAt as string,
  };
}

const Page = () => {
  const router = useRouter();

  // Data state
  const [posts, setPosts] = useState<JobPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Filter state
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedDay, setSelectedDay] = useState("");

  // Cancel modal
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [cancelTarget, setCancelTarget] = useState<JobPost | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  // Current year for year filter
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) =>
    (currentYear - i).toString()
  );

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

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch jobs from API
  const fetchJobs = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const params = new URLSearchParams();
      if (filterStatus !== "all") params.set("status", filterStatus);
      if (debouncedSearch) params.set("search", debouncedSearch);
      params.set("limit", "200");

      const res = await fetch(`/api/v1/jobs?${params.toString()}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Failed to fetch jobs (${res.status})`);
      }
      const data = await res.json();
      const mapped = (data.jobs ?? []).map(mapApiJob);
      setPosts(mapped);
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : "Failed to fetch");
    } finally {
      setIsLoading(false);
    }
  }, [filterStatus, debouncedSearch]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // Client-side date filtering (extract date from jobId format J-DDMMYYNN)
  const filteredPosts = useMemo(() => {
    if (!selectedYear && !selectedMonth && !selectedDay) return posts;

    return posts.filter((post) => {
      // Try to parse date from jobId: J-DDMMYYNN
      const jobId = post.id;
      if (!jobId || jobId.length < 10) return true;
      const day = parseInt(jobId.substring(2, 4), 10);
      const month = parseInt(jobId.substring(4, 6), 10);
      const year = parseInt("20" + jobId.substring(6, 8), 10);

      if (selectedYear && year !== parseInt(selectedYear, 10)) return false;
      if (selectedMonth && month !== parseInt(selectedMonth, 10)) return false;
      if (selectedDay && day !== parseInt(selectedDay, 10)) return false;
      return true;
    });
  }, [posts, selectedYear, selectedMonth, selectedDay]);

  const handleViewPost = (post: JobPost) => {
    router.push(`/admin/jobs/${post.id}`);
  };

  const handleEditPost = (post: JobPost) => {
    router.push(`/admin/jobs/${post.id}/edit`);
  };

  const handleCancelPost = (post: JobPost) => {
    setCancelTarget(post);
    onOpen();
  };

  const confirmCancel = async () => {
    if (!cancelTarget) return;
    setIsCancelling(true);
    try {
      const res = await fetch(`/api/v1/jobs/${cancelTarget.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to cancel job post");
      }
      addToast({ description: "Job post cancelled successfully!", color: "success" });
      onClose();
      setCancelTarget(null);
      fetchJobs();
    } catch (error) {
      addToast({
        description:
          error instanceof Error ? error.message : "Failed to cancel post",
        color: "danger",
      });
    } finally {
      setIsCancelling(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilterStatus("all");
    setSelectedYear("");
    setSelectedMonth("");
    setSelectedDay("");
  };

  const hasActiveFilters =
    searchTerm || filterStatus !== "all" || selectedYear || selectedMonth || selectedDay;

  return (
    <div className="container mx-auto px-4 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-default-900">Job Posts</h1>
          <p className="text-sm text-default-500">
            Manage and track all job postings
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="flat"
            startContent={<RefreshCw size={16} />}
            onPress={fetchJobs}
            isLoading={isLoading}
          >
            Refresh
          </Button>
          <Button
            size="sm"
            color="primary"
            startContent={<Plus size={16} />}
            onPress={() => router.push("/admin/jobs/create")}
          >
            New Job
          </Button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="space-y-3 mb-4">
        <div className="flex gap-2">
          <Input
            placeholder="Search jobs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            startContent={<Search size={18} className="text-default-400" />}
            endContent={
              searchTerm && (
                <button onClick={() => setSearchTerm("")}>
                  <X size={16} className="text-default-400" />
                </button>
              )
            }
            className="flex-1"
            size="sm"
          />
          <Button
            size="sm"
            variant={showFilters ? "flat" : "bordered"}
            startContent={<Filter size={16} />}
            onPress={() => setShowFilters(!showFilters)}
          >
            Filters
          </Button>
        </div>

        {showFilters && (
          <Card>
            <CardBody className="gap-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Select
                  label="Status"
                  size="sm"
                  selectedKeys={[filterStatus]}
                  onChange={(e) => setFilterStatus(e.target.value || "all")}
                >
                  <SelectItem key="all">All Statuses</SelectItem>
                  <SelectItem key="open">Open</SelectItem>
                  <SelectItem key="closed">Closed</SelectItem>
                  <SelectItem key="hold">Hold</SelectItem>
                  <SelectItem key="cancelled">Cancelled</SelectItem>
                </Select>

                <Select
                  label="Year"
                  size="sm"
                  selectedKeys={selectedYear ? [selectedYear] : []}
                  onChange={(e) => setSelectedYear(e.target.value)}
                >
                  {years.map((y) => (
                    <SelectItem key={y}>{y}</SelectItem>
                  ))}
                </Select>

                <Select
                  label="Month"
                  size="sm"
                  selectedKeys={selectedMonth ? [selectedMonth] : []}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                >
                  {months.map((m) => (
                    <SelectItem key={m.key}>{m.label}</SelectItem>
                  ))}
                </Select>

                <Select
                  label="Day"
                  size="sm"
                  selectedKeys={selectedDay ? [selectedDay] : []}
                  onChange={(e) => setSelectedDay(e.target.value)}
                >
                  {Array.from({ length: 31 }, (_, i) => (
                    <SelectItem key={String(i + 1)}>{String(i + 1)}</SelectItem>
                  ))}
                </Select>
              </div>

              {hasActiveFilters && (
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    variant="light"
                    color="danger"
                    startContent={<X size={14} />}
                    onPress={clearFilters}
                  >
                    Clear Filters
                  </Button>
                </div>
              )}
            </CardBody>
          </Card>
        )}
      </div>

      <Divider className="mb-4" />

      {/* Loading */}
      {isLoading && (
        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>
      )}

      {/* Error */}
      {fetchError && !isLoading && (
        <Card className="bg-danger-50 mb-4">
          <CardBody className="py-10 text-center">
            <p className="text-danger">{fetchError}</p>
            <Button size="sm" className="mt-3" onPress={fetchJobs}>
              Retry
            </Button>
          </CardBody>
        </Card>
      )}

      {/* Results */}
      {!isLoading && !fetchError && (
        <>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-default-500">
              {filteredPosts.length} post{filteredPosts.length !== 1 ? "s" : ""}{" "}
              found
            </p>
          </div>

          {filteredPosts.length === 0 ? (
            <Card>
              <CardBody className="py-10 text-center">
                <p className="text-default-500">No job posts found.</p>
              </CardBody>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPosts.map((post) => (
                <JobPostCard
                  key={post.id}
                  post={post}
                  onView={handleViewPost}
                  onEdit={handleEditPost}
                  onCancel={handleCancelPost}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Cancel Confirmation Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          {() => (
            <>
              <ModalHeader>Cancel Job Post</ModalHeader>
              <ModalBody>
                <p>
                  Are you sure you want to cancel the job post{" "}
                  <strong>{cancelTarget?.title}</strong> ({cancelTarget?.id})?
                </p>
                <p className="text-sm text-default-500">
                  This will mark the post as cancelled.
                </p>
              </ModalBody>
              <ModalFooter>
                <Button
                  color="default"
                  variant="light"
                  onPress={onClose}
                  isDisabled={isCancelling}
                >
                  No, Keep Post
                </Button>
                <Button
                  color="danger"
                  onPress={confirmCancel}
                  isLoading={isCancelling}
                >
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

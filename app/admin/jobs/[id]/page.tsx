"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Button } from "@heroui/button";
import { Accordion, AccordionItem } from "@heroui/accordion";
import { Divider } from "@heroui/divider";
import { Spinner } from "@heroui/spinner";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/modal";
import {
  JobCandidateCard,
  JobCandidate,
} from "@/components/applicationCards/JobCandidateCard";
import {
  ArrowLeft,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Trash2,
  Pencil,
} from "lucide-react";
import { addToast } from "@heroui/toast";

interface JobPostData {
  _id: string;
  jobId: string;
  workType: string;
  title: string;
  clientName: string;
  phoneNumber: string;
  companyType: string;
  locationType: string;
  location: string;
  timing: string;
  experience?: string;
  gender: string;
  salary?: string;
  requiredQualification?: string;
  projectType?: string;
  budget?: string;
  duration?: string;
  brief?: string;
  status: string;
  commissionBasis: string;
  academyCommissionPercentage: number;
  createdAt: string;
  updatedAt: string;
}

export default function ViewJobPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id: postId } = React.use(params);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isClearing, setIsClearing] = useState<boolean>(false);
  const [candidates, setCandidates] = useState<JobCandidate[]>([]);
  const [postData, setPostData] = useState<JobPostData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJob = async () => {
      setIsLoading(true);
      setFetchError(null);
      try {
        const res = await fetch(`/api/v1/jobs/${postId}`);
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || `Failed to fetch job (${res.status})`);
        }
        const { job } = await res.json();
        setPostData(job);
      } catch (err) {
        setFetchError(
          err instanceof Error ? err.message : "Failed to fetch job"
        );
      } finally {
        setIsLoading(false);
      }
    };
    fetchJob();
  }, [postId]);

  const handleViewDetails = (candidate: JobCandidate) => {
    router.push(`/admin/jobs/${postId}/candidate/${candidate.id}`);
  };

  const handleBack = () => {
    router.push("/admin/jobs");
  };
  const handleClearAllCandidates = async () => {
    setIsClearing(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // TODO: Replace with actual API call
      // await clearAllCandidates(postId);

      const clearedCount = candidates.length;
      
      // Clear all candidates from state
      setCandidates([]);

      addToast({
        description: `All candidates cleared successfully! ${clearedCount} candidate(s) removed.`,
        color: "success",
      });

      onClose();
    } catch (error) {
      addToast({
        description: "Failed to clear candidates",
        color: "danger",
      });
    } finally {
      setIsClearing(false);
    }
  };
  // Categorize candidates based on recruitment status
  const categorizedCandidates = useMemo(() => {
    const hasApproved = candidates.some((c) => c.status === "approved");

    const approved = candidates.filter((c) => c.status === "approved");
    const pending = candidates.filter((c) => c.status === "pending");
    const declined = candidates.filter((c) => c.status === "declined");
    const withdrawn = candidates.filter((c) => c.status === "withdrawn");

    // Determine waiting list label and candidates
    let waitingListLabel = "Waiting List";
    let waitingListCandidates = pending;

    if (hasApproved) {
      waitingListLabel = "Declined Candidates";
      waitingListCandidates = [...pending, ...declined];
    }

    return {
      approved,
      waitingListLabel,      waitingListCandidates,
      withdrawn,
      hasApproved,
    };
  }, [candidates]);

  const getStatsData = () => {
    return [
      {
        label: "Applicants",
        count: candidates.length,
        icon: Users,
        color: "primary",
      },
      {
        label: "Pending",
        count: categorizedCandidates.waitingListCandidates.length,
        icon: Clock,
        color: "warning",
      },
      {
        label: "Approved",
        count: categorizedCandidates.approved.length,
        icon: CheckCircle,
        color: "success",
      },
      {
        label: "Withdrawn",
        count: categorizedCandidates.withdrawn.length,
        icon: XCircle,
        color: "danger",
      },
    ];
  };
  return (
    <div className="container mx-auto px-4 max-w-7xl">
      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>
      )}

      {/* Error State */}
      {fetchError && (
        <>
          <Button
            size="sm"
            variant="light"
            startContent={<ArrowLeft size={18} />}
            onPress={() => router.push("/admin/jobs")}
            className="mb-4"
          >
            Back to Posts
          </Button>
          <Card className="bg-danger-50">
            <CardBody className="py-10 text-center">
              <p className="text-danger">{fetchError}</p>
            </CardBody>
          </Card>
        </>
      )}

      {/* Main Content */}
      {!isLoading && !fetchError && postData && (
        <>
      {/* Header with Back and Clear All Buttons */}
      <div className="space-y-3 mb-3">
        <div className="flex items-center justify-between">
          <Button
            size="sm"
            variant="light"
            startContent={<ArrowLeft size={18} />}
            onPress={handleBack}
          >
            Back to Posts
          </Button>
          <div className="flex gap-2">
            <Button
              size="sm"
              color="primary"
              variant="flat"
              startContent={<Pencil size={18} />}
              onPress={() => router.push(`/admin/jobs/${postId}/edit`)}
            >
              Edit
            </Button>
            {candidates.length > 0 && (
              <Button
                size="sm"
                color="danger"
                variant="flat"
                startContent={<Trash2 size={18} />}
                onPress={onOpen}
              >
                Clear All Candidates ({candidates.length})
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <Card>
            <CardHeader className="flex-col items-start gap-3 pb-4">
              <div className="flex flex-col w-full">
                <div className="flex justify-between">
                  <p className="text-sm text-default-400">
                    Post ID: {postData.jobId}
                  </p>
                  <div className="flex gap-2">
                    <Chip
                      size="sm"
                      color="primary"
                      variant="flat"
                      className="capitalize"
                    >
                      {postData.workType}
                    </Chip>
                    <Chip
                      size="sm"
                      color={postData.status === "open" ? "success" : postData.status === "hold" ? "warning" : "danger"}
                      variant="flat"
                      className="capitalize"
                    >
                      {postData.status}
                    </Chip>
                  </div>
                </div>
                <div className="flex-1">
                  <h1 className="text-lg font-bold text-default-900">
                    {postData.title}
                  </h1>
                  <p className="text-xs text-default-500">{postData.clientName}</p>
                </div>
              </div>

              <Divider />

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full h-full">
                <div className="flex flex-col">
                  <span className="text-xs text-default-500">Location</span>
                  <span className="font-medium text-default-900">
                    {postData.location}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-default-500">
                    {postData.workType === "job" ? "Salary" : "Budget"}
                  </span>
                  <span className="font-medium text-success-600">
                    {postData.workType === "job"
                      ? postData.salary || "Not specified"
                      : postData.budget || "Not specified"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-default-500">Timing</span>
                  <span className="font-medium text-default-900">
                    {postData.timing}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-default-500">Commission</span>
                  <span className="font-medium text-default-900">
                    {postData.academyCommissionPercentage}%
                  </span>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Statistics Cards */}
          <div className="grid grid-cols-4 md:grid-cols-2 gap-2">
            {getStatsData().map((stat) => {
              return (
                <Card key={stat.label}>
                  <CardBody className="flex flex-row items-center gap-3 p-2">
                    <div className="flex-1 text-center">
                      <p className="text-md font-bold text-default-900">
                        {stat.count}
                      </p>
                      <p className="text-xs text-default-500">{stat.label}</p>
                    </div>
                  </CardBody>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
      <Divider />
      {/* Candidates Sections */}
      <div className="space-y-3">
        {/* Approved Candidates */}
        {categorizedCandidates.approved.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle size={20} className="text-success" />
              <h2 className="text-xl font-semibold">Approved Candidates</h2>
              <Chip size="sm" color="success" variant="flat">
                {categorizedCandidates.approved.length}
              </Chip>
            </div>
            <div className="space-y-3 grid grid-cols-1 md:grid-cols-3 gap-3">
              {categorizedCandidates.approved.map((candidate) => (
                <JobCandidateCard
                  key={candidate.id}
                  candidate={candidate}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>
          </div>
        )}

        {/* Waiting List / Declined List */}
        {categorizedCandidates.waitingListCandidates.length > 0 && (
          <div>
            <Accordion variant="bordered">
              <AccordionItem
                key="1"
                aria-label={categorizedCandidates.waitingListLabel}
                title={
                  <div className="flex items-center gap-2">
                    {categorizedCandidates.hasApproved ? (
                      <XCircle size={20} className="text-danger" />
                    ) : (
                      <Clock size={20} className="text-warning" />
                    )}
                    <span className="font-semibold">
                      {categorizedCandidates.waitingListLabel}
                    </span>
                    <Chip
                      size="sm"
                      color={
                        categorizedCandidates.hasApproved ? "danger" : "warning"
                      }
                      variant="flat"
                    >
                      {categorizedCandidates.waitingListCandidates.length}
                    </Chip>
                  </div>
                }
              >
                <div className="space-y-3 grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                  {categorizedCandidates.waitingListCandidates.map(
                    (candidate) => (
                      <JobCandidateCard
                        key={candidate.id}
                        candidate={candidate}
                        onViewDetails={handleViewDetails}
                      />
                    )
                  )}
                </div>
              </AccordionItem>
            </Accordion>
          </div>
        )}

        {/* Withdrawn Candidates */}
        {categorizedCandidates.withdrawn.length > 0 && (
          <div>
            <Accordion variant="bordered">
              <AccordionItem
                key="2"
                aria-label="Withdrawn Candidates"
                title={
                  <div className="flex items-center gap-2">
                    <XCircle size={20} className="text-default-400" />
                    <span className="font-semibold">Withdrawn Candidates</span>
                    <Chip size="sm" variant="flat">
                      {categorizedCandidates.withdrawn.length}
                    </Chip>
                  </div>
                }
              >
                <div className="space-y-3 grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                  {categorizedCandidates.withdrawn.map((candidate) => (
                    <JobCandidateCard
                      key={candidate.id}
                      candidate={candidate}
                      onViewDetails={handleViewDetails}
                    />
                  ))}
                </div>
              </AccordionItem>
            </Accordion>
          </div>
        )}        {/* No Candidates */}
        {candidates.length === 0 && (
          <Card>
            <CardBody className="py-10 text-center">
              <AlertCircle
                size={48}
                className="mx-auto text-default-300 mb-4"
              />
              <p className="text-default-500">
                No candidates have applied for this job post yet.
              </p>
            </CardBody>
          </Card>
        )}
      </div>

      {/* Clear All Candidates Confirmation Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            Clear All Candidates
          </ModalHeader>
          <ModalBody>
            <p>
              Are you sure you want to clear <strong>all {candidates.length} candidate(s)</strong> from this job post?
            </p>
            <p className="text-sm text-danger">
              ⚠️ This action cannot be undone. All candidates will be permanently
              removed from this post.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onClose} isDisabled={isClearing}>
              Cancel
            </Button>
            <Button
              color="danger"
              onPress={handleClearAllCandidates}
              isLoading={isClearing}
            >
              Clear All
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
        </>
      )}
    </div>
  );
}

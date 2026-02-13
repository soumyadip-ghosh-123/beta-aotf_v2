"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Button } from "@heroui/button";
import { Accordion, AccordionItem } from "@heroui/accordion";
import { Divider } from "@heroui/divider";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/modal";
import {
  CandidateCard,
  Candidate,
} from "@/components/applicationCards/TuitionCandidateCard";
import {
  ArrowLeft,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Trash2,
} from "lucide-react";
import { addToast } from "@heroui/toast";

// Sample data - replace with actual API call
const sampleCandidates: Candidate[] = [
  {
    id: "C001",
    name: "Sarah Jenkins",
    email: "sarah.j@example.com",
    phone: "9876543210",
    avatar: undefined,
    qualification: "B.Ed in Mathematics",
    experience: "5 years",
    location: "Salt Lake, Kolkata",
    status: "approved",
    appliedDate: "2026-02-01",
  },
  {
    id: "C002",
    name: "Michael Chen",
    email: "michael.c@example.com",
    phone: "9876543211",
    avatar: undefined,
    qualification: "M.Sc Mathematics",
    experience: "3 years",
    location: "Park Street, Kolkata",
    status: "DC",
    appliedDate: "2026-02-02",
  },
  {
    id: "C003",
    name: "Amanda Rose",
    email: "amanda.r@corp.com",
    phone: "9876543212",
    avatar: undefined,
    qualification: "B.Sc, B.Ed",
    experience: "7 years",
    location: "Howrah",
    status: "pending",
    appliedDate: "2026-02-03",
  },
  {
    id: "C004",
    name: "David Kim",
    email: "david.k@example.com",
    phone: "9876543213",
    avatar: undefined,
    qualification: "M.A Education",
    experience: "2 years",
    location: "Jadavpur, Kolkata",
    status: "pending",
    appliedDate: "2026-02-04",
  },
  {
    id: "C005",
    name: "Emily Stone",
    email: "emily.stone@design.io",
    phone: "9876543214",
    avatar: undefined,
    qualification: "B.Ed",
    experience: "4 years",
    location: "New Town, Kolkata",
    status: "pending",
    appliedDate: "2026-02-05",
  },
];

export default function ViewPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id: postId } = React.use(params);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isClearing, setIsClearing] = useState<boolean>(false);
  const [candidates, setCandidates] = useState<Candidate[]>(sampleCandidates);

  // Sample post data - replace with actual API call
  const postData = {
    id: postId,
    title: "All Subjects - Class 9",
    subtitle: "WB-English Version • Rajabazar, Sealdah",
    guardian: "MD Faiyaz uddin",
    guardianPhone: "8910222010",
    status: "open",
    budget: 3000,
  };

  const handleViewDetails = (candidate: Candidate) => {
    router.push(`/admin/tuitions/${postId}/candidate/${candidate.id}`);
  };

  const handleBack = () => {
    router.push("/admin/tuitions");
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
    const hasDC = candidates.some((c) => c.status === "DC");
    const hasGC = candidates.some((c) => c.status === "GC");

    const approved = candidates.filter((c) => c.status === "approved");
    const inDC = candidates.filter((c) => c.status === "DC");
    const inGC = candidates.filter((c) => c.status === "GC");
    const pending = candidates.filter((c) => c.status === "pending");
    const declined = candidates.filter((c) => c.status === "declined");
    const withdrawn = candidates.filter((c) => c.status === "withdrawn");

    // Determine waiting list or declined list
    let waitingListLabel = "Waiting List";
    let waitingListCandidates = [...pending];

    if (hasApproved) {
      // If someone is approved, all others go to declined
      waitingListLabel = "Declined Candidates";
      waitingListCandidates = [
        ...pending,
        ...inDC.filter((c) => c.id !== approved[0]?.id),
        ...inGC.filter((c) => c.id !== approved[0]?.id),
        ...declined,
      ];
    } else if (hasDC || hasGC) {
      // If someone is in DC/GC, others are in waiting
      waitingListLabel = "Waiting List";
      waitingListCandidates = [...pending];
    }

    return {
      approved,
      inDC,
      inGC,
      waitingListLabel,
      waitingListCandidates,
      declined,
      withdrawn,
      hasApproved,
      hasDC,      hasGC,
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
        label: "In Process",
        count:
          categorizedCandidates.inDC.length + categorizedCandidates.inGC.length,
        icon: AlertCircle,
        color: "secondary",
      },
      {
        label: "Approved",
        count: categorizedCandidates.approved.length,
        icon: CheckCircle,
        color: "success",
      },
    ];
  };
  return (
    <div className="container mx-auto px-4 max-w-7xl space-y-3">
      {/* Header with Back and Clear All Buttons */}
      <div className="flex items-center justify-between mb-4">
        <Button
          size="sm"
          variant="light"
          startContent={<ArrowLeft size={18} />}
          onPress={handleBack}        >
          Back to Posts
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

      <div className="grid grid-cols-1 md:grid-cols-2 items-start gap-2">
        <Card className="w-full">
          <CardHeader className="flex-col items-start gap-3 pb-4">
            <div className="flex flex-col justify-between w-full">
              <div className="flex justify-between">
                <p className="text-sm text-default-400">
                  Post ID: {postData.id}
                </p>
                <Chip
                  size="sm"
                  color={postData.status === "open" ? "success" : "warning"}
                  variant="flat"
                  className="capitalize"
                >
                  {postData.status}
                </Chip>
              </div>

              <div className="flex-1">
                <h1 className="text-lg font-bold text-default-900">
                  {postData.title}
                </h1>
              </div>
              <p className="text-xs text-default-500">{postData.subtitle}</p>
            </div>

            <div className="grid grid-cols-3 justify-items-center w-full">
              <div>
                <span className="text-default-500">Guardian:</span> <br />
                <span className="font-medium text-sm">{postData.guardian}</span>
              </div>
              <div>
                <span className="text-default-500">Phone:</span> <br />
                <span className="font-medium text-sm">
                  {postData.guardianPhone}
                </span>
              </div>
              <div>
                <span className="text-default-500">Monthly Fees:</span> <br />
                <span className="font-medium text-sm text-success">
                  ₹{postData.budget}
                </span>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Statistics */}
        <div className="grid grid-cols-4 md:grid-cols-2 gap-2">
          {getStatsData().map((stat) => (
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
          ))}
        </div>
      </div>

      <Divider />

      {/* Candidates Section */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Approved Candidates */}
          {categorizedCandidates.approved.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle size={20} className="text-success" />
                <h2 className="text-xl font-semibold">Approved Candidate</h2>
                <Chip size="sm" color="success" variant="flat">
                  {categorizedCandidates.approved.length}
                </Chip>
              </div>
              <div className="space-y-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                {categorizedCandidates.approved.map((candidate) => (
                  <CandidateCard
                    key={candidate.id}
                    candidate={candidate}
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </div>
            </div>
          )}

          {/* In Demo Class (DC) */}
          {categorizedCandidates.inDC.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle size={20} className="text-primary" />
                <h2 className="text-xl font-semibold">Demo Class (DC)</h2>
                <Chip size="sm" color="primary" variant="flat">
                  {categorizedCandidates.inDC.length}
                </Chip>
              </div>
              <div className="space-y-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                {categorizedCandidates.inDC.map((candidate) => (
                  <CandidateCard
                    key={candidate.id}
                    candidate={candidate}
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* In Guardian Call (GC) */}
        {categorizedCandidates.inGC.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle size={20} className="text-secondary" />
              <h2 className="text-xl font-semibold">Guardian Call (GC)</h2>
              <Chip size="sm" color="secondary" variant="flat">
                {categorizedCandidates.inGC.length}
              </Chip>
            </div>
            <div className="space-y-3">
              {categorizedCandidates.inGC.map((candidate) => (
                <CandidateCard
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                  {categorizedCandidates.waitingListCandidates.map(
                    (candidate) => (
                      <CandidateCard
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
                    <Chip size="sm" color="default" variant="flat">
                      {categorizedCandidates.withdrawn.length}
                    </Chip>
                  </div>
                }
              >                <div className="space-y-3 pt-2">
                  {categorizedCandidates.withdrawn.map((candidate) => (
                    <CandidateCard
                      key={candidate.id}
                      candidate={candidate}
                      onViewDetails={handleViewDetails}
                    />
                  ))}
                </div>
              </AccordionItem>
            </Accordion>
          </div>
        )}
      </div>

      {/* Clear All Candidates Confirmation Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            Clear All Candidates
          </ModalHeader>          <ModalBody>
            <p>
              Are you sure you want to clear <strong>all {candidates.length} candidate(s)</strong> from this tuition post?
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
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { Tabs, Tab } from "@heroui/tabs";
import { Card, CardBody, CardHeader, CardFooter } from "@heroui/card";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@heroui/modal";
import { Select, SelectItem } from "@heroui/select";
import { Textarea } from "@heroui/input";
import { addToast } from "@heroui/toast";
import { MessageSquare, Star, Calendar, User, Filter } from "lucide-react";

type Category = "bug" | "suggestion" | "complaint" | "payment" | "general";
type Status = "open" | "pending" | "resolved";

type FeedbackData = {
  id: string;
  userName: string;
  userEmail: string;
  category: Category;
  subject: string;
  query: string;
  rating: number;
  status: Status;
  createdAt: string;
  adminNotes?: string;
};

// Mock data
const mockFeedbacks: FeedbackData[] = [
  {
    id: "fb1",
    userName: "Pritam Mahata",
    userEmail: "pritam@example.com",
    category: "bug",
    subject: "Login Issue",
    query: "Unable to login with correct credentials",
    rating: 2,
    status: "open",
    createdAt: "2024-02-05",
  },
  {
    id: "fb2",
    userName: "Anita Sharma",
    userEmail: "anita@example.com",
    category: "suggestion",
    subject: "Add Dark Mode",
    query: "Please add dark mode support for better user experience",
    rating: 5,
    status: "pending",
    createdAt: "2024-02-06",
    adminNotes: "Under consideration for next release",
  },
  {
    id: "fb3",
    userName: "Rahul Kumar",
    userEmail: "rahul@example.com",
    category: "payment",
    subject: "Payment Failed",
    query: "Payment was deducted but subscription not activated",
    rating: 1,
    status: "resolved",
    createdAt: "2024-02-04",
    adminNotes: "Refund processed and subscription activated manually",
  },
  {
    id: "fb4",
    userName: "Sneha Patel",
    userEmail: "sneha@example.com",
    category: "complaint",
    subject: "Poor Service",
    query: "Teacher was not responsive to queries",
    rating: 2,
    status: "pending",
    createdAt: "2024-02-07",
  },
  {
    id: "fb5",
    userName: "Amit Singh",
    userEmail: "amit@example.com",
    category: "general",
    subject: "Great Platform",
    query: "Really enjoying the platform, keep up the good work!",
    rating: 5,
    status: "resolved",
    createdAt: "2024-02-03",
    adminNotes: "Thank you note sent",
  },
];

export default function FeedbackPage() {
  const [selectedStatus, setSelectedStatus] = useState<Status>("open");
  const [feedbacks, setFeedbacks] = useState<FeedbackData[]>(mockFeedbacks);
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackData | null>(null);
  const [filterCategory, setFilterCategory] = useState<Category | "all">("all");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [adminNotes, setAdminNotes] = useState("");
  const [newStatus, setNewStatus] = useState<Status>("open");

  const filteredFeedbacks = feedbacks.filter((fb) => {
    const matchesStatus = fb.status === selectedStatus;
    const matchesCategory = filterCategory === "all" || fb.category === filterCategory;
    return matchesStatus && matchesCategory;
  });

  const handleViewFeedback = (feedback: FeedbackData) => {
    setSelectedFeedback(feedback);
    setAdminNotes(feedback.adminNotes || "");
    setNewStatus(feedback.status);
    onOpen();
  };

  const handleUpdateFeedback = () => {
    if (!selectedFeedback) return;

    const updated = feedbacks.map((fb) =>
      fb.id === selectedFeedback.id
        ? { ...fb, status: newStatus, adminNotes: adminNotes }
        : fb
    );

    setFeedbacks(updated);
    addToast({ description: "Feedback updated successfully", color: "success" });
    onClose();
    setSelectedFeedback(null);
  };

  const getCategoryColor = (category: Category): "primary" | "success" | "warning" | "danger" | "default" => {
    const colors: Record<Category, "primary" | "success" | "warning" | "danger" | "default"> = {
      bug: "danger",
      suggestion: "primary",
      complaint: "warning",
      payment: "warning",
      general: "default",
    };
    return colors[category];
  };

  const getStatusColor = (status: Status): "success" | "warning" | "default" => {
    const colors: Record<Status, "success" | "warning" | "default"> = {
      open: "warning",
      pending: "default",
      resolved: "success",
    };
    return colors[status];
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            className={star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="w-full space-y-6 py-4">
      <div className="flex flex-col md:flex-row justify-between">
        <div>
          <h1 className="text-2xl font-bold">Feedback Management</h1>
          <p className="text-sm text-default-500 mt-1">
            Manage and respond to user feedback
          </p>
        </div>
        <div className="flex items-center gap-2 justify-end">
          <Filter size={18} className="text-default-400" />
          <Select
            placeholder="Filter by category"
            selectedKeys={[filterCategory]}
            onChange={(e: any) => setFilterCategory(e.target.value)}
            className="w-48"
            size="sm"
            variant="bordered"
          >
            <SelectItem key="all">All Categories</SelectItem>
            <SelectItem key="bug">Bug</SelectItem>
            <SelectItem key="suggestion">Suggestion</SelectItem>
            <SelectItem key="complaint">Complaint</SelectItem>
            <SelectItem key="payment">Payment</SelectItem>
            <SelectItem key="general">General</SelectItem>
          </Select>
        </div>
      </div>

      <Tabs
        selectedKey={selectedStatus}
        onSelectionChange={(key) => setSelectedStatus(key as Status)}
        aria-label="Feedback status"
        color="primary"
      >
        <Tab
          key="open"
          title={`Open (${feedbacks.filter((f) => f.status === "open").length})`}
        />
        <Tab
          key="pending"
          title={`Pending (${feedbacks.filter((f) => f.status === "pending").length})`}
        />
        <Tab
          key="resolved"
          title={`Resolved (${feedbacks.filter((f) => f.status === "resolved").length})`}
        />
      </Tabs>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFeedbacks.map((feedback) => (
          <Card key={feedback.id} className="w-full">
            <CardHeader className="flex flex-col gap-3 items-start">
              <div className="flex justify-between w-full items-start">
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <MessageSquare className="text-primary" size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{feedback.userName}</p>
                    <p className="text-xs text-default-500">{feedback.userEmail}</p>
                  </div>
                </div>
                <Chip size="sm" color={getCategoryColor(feedback.category)} variant="flat">
                  {feedback.category}
                </Chip>
              </div>
              <div className="w-full">
                <p className="text-md font-semibold">{feedback.subject}</p>
                {renderStars(feedback.rating)}
              </div>
            </CardHeader>
            <CardBody className="space-y-2">
              <p className="text-sm text-default-600 line-clamp-3">
                {feedback.query}
              </p>
              <div className="flex items-center gap-2 text-xs text-default-500">
                <Calendar size={14} />
                {new Date(feedback.createdAt).toLocaleDateString()}
              </div>
            </CardBody>
            <CardFooter className="gap-2">
              <Button
                size="sm"
                variant="flat"
                color="primary"
                className="flex-1"
                onPress={() => handleViewFeedback(feedback)}
              >
                View Details
              </Button>
              <Chip size="sm" color={getStatusColor(feedback.status)} variant="flat">
                {feedback.status}
              </Chip>
            </CardFooter>
          </Card>
        ))}
      </div>

      {filteredFeedbacks.length === 0 && (
        <div className="text-center py-12">
          <MessageSquare size={48} className="mx-auto text-default-300 mb-4" />
          <p className="text-default-500">
            No {selectedStatus} feedbacks found
            {filterCategory !== "all" && ` in ${filterCategory} category`}.
          </p>
        </div>
      )}

      {/* Feedback Detail Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="2xl" scrollBehavior="inside">
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            Feedback Details
          </ModalHeader>
          <ModalBody>
            {selectedFeedback && (
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <User size={16} className="text-default-400" />
                      <span className="font-semibold">{selectedFeedback.userName}</span>
                    </div>
                    <p className="text-sm text-default-500 ml-6">
                      {selectedFeedback.userEmail}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Chip color={getCategoryColor(selectedFeedback.category)} variant="flat">
                      {selectedFeedback.category}
                    </Chip>
                    <Chip color={getStatusColor(selectedFeedback.status)} variant="flat">
                      {selectedFeedback.status}
                    </Chip>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="font-semibold text-lg">{selectedFeedback.subject}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-default-500">Rating:</span>
                    {renderStars(selectedFeedback.rating)}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-default-500">
                    <Calendar size={14} />
                    Submitted on {new Date(selectedFeedback.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="font-semibold text-sm">User Message:</p>
                  <Card className="bg-default-100">
                    <CardBody>
                      <p className="text-sm">{selectedFeedback.query}</p>
                    </CardBody>
                  </Card>
                </div>

                <div className="space-y-2">
                  <label className="font-semibold text-sm">Update Status:</label>
                  <Select
                    selectedKeys={[newStatus]}
                    onChange={(e: any) => setNewStatus(e.target.value as Status)}
                    variant="bordered"
                  >
                    <SelectItem key="open">Open</SelectItem>
                    <SelectItem key="pending">Pending</SelectItem>
                    <SelectItem key="resolved">Resolved</SelectItem>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="font-semibold text-sm">Admin Notes:</label>
                  <Textarea
                    placeholder="Add internal notes or response details..."
                    value={adminNotes}
                    onChange={(e: any) => setAdminNotes(e.target.value)}
                    variant="bordered"
                    minRows={4}
                  />
                </div>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={onClose}>
              Cancel
            </Button>
            <Button color="primary" onPress={handleUpdateFeedback}>
              Update Feedback
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
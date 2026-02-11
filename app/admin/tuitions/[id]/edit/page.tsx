"use client";

import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Input, Textarea } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Checkbox, CheckboxGroup } from "@heroui/checkbox";
import { Divider } from "@heroui/divider";
import { addToast } from "@heroui/toast";
import {
  ArrowLeft,
  Save,
  X,
  BookOpen,
  User,
  Phone,
  MapPin,
  DollarSign,
} from "lucide-react";
import { FaRupeeSign } from "react-icons/fa";

// Sample data - replace with actual API call
const getTuitionPostData = (id: string) => {
  const posts: Record<string, any> = {
    "P-05022600": {
      id: "P-05022600",
      title: "All Subjects - Class 9",
      guardian: "MD Faiyaz uddin",
      guardianPhone: "8910222010",
      className: "9",
      subject: "All Subjects",
      board: "WB-English Version",
      location: "Rajabazar, Sealdah",
      budget: 3000,
      classType: "in-person",
      frequency: "four",
      preferredDays: ["Monday", "Tuesday", "Wednesday", "Thursday"],
      notes: "",
      status: "open",
    },
    "P-05022601": {
      id: "P-05022601",
      title: "Mathematics - Class 10",
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
    },
  };

  return posts[id] || null;
};

export default function EditTuitionPostPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id: postId } = React.use(params);

  const existingPost = getTuitionPostData(postId);

  const [formData, setFormData] = useState({
    guardian: existingPost?.guardian || "",
    guardianPhone: existingPost?.guardianPhone || "",
    className: existingPost?.className || "",
    subject: existingPost?.subject || "",
    board: existingPost?.board || "",
    location: existingPost?.location || "",
    budget: existingPost?.budget?.toString() || "",
    classType: existingPost?.classType || "in-person",
    frequency: existingPost?.frequency || "three",
    preferredDays: existingPost?.preferredDays || [],
    notes: existingPost?.notes || "",
    status: existingPost?.status || "open",
  });

  const [isSaving, setIsSaving] = useState(false);

  if (!existingPost) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <Card>
          <CardBody>
            <p className="text-center text-danger">Post not found</p>
          </CardBody>
        </Card>
      </div>
    );
  }

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleBack = () => {
    router.push(`/admin/tuitions/${postId}`);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // TODO: Replace with actual API call
      // await updateTuitionPost(postId, formData);

      addToast({
        description: "Tuition post updated successfully!",
        color: "success",
      });

      router.push(`/admin/tuitions/${postId}`);
    } catch (error) {
      addToast({
        description: "Failed to update tuition post",
        color: "danger",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    router.push(`/admin/tuitions/${postId}`);
  };

  const boards = ["CBSE", "ICSE", "WB-English Version", "WB-Bengali Version"];
  const classes = Array.from({ length: 12 }, (_, i) => (i + 1).toString());
  const subjects = [
    "All Subjects",
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "English",
    "Hindi",
    "Bengali",
    "History",
    "Geography",
    "Economics",
    "Commerce",
    "Accountancy",
  ];

  const weekDays = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <Button
          size="sm"
          variant="light"
          startContent={<ArrowLeft size={18} />}
          onPress={handleBack}
          className="mb-4"
        >
          Back to Post
        </Button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-default-900">
              Edit Tuition Post
            </h1>
            <p className="text-sm text-default-500 mt-1">Post ID: {postId}</p>
          </div>
          <Chip
            size="lg"
            color={formData.status === "open" ? "success" : "danger"}
            variant="flat"
            className="capitalize"
          >
            {formData.status}
          </Chip>
        </div>
      </div>

      {/* Form */}
      <div className="space-y-6">
        {/* Guardian Details */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User size={20} className="text-primary" />
              <h2 className="text-xl font-bold">Guardian Details</h2>
            </div>
          </CardHeader>
          <Divider />
          <CardBody className="gap-4">
            <Input
              label="Guardian Name"
              placeholder="Enter guardian name"
              value={formData.guardian}
              onChange={(e) => handleChange("guardian", e.target.value)}
              startContent={<User size={18} className="text-default-400" />}
              isRequired
            />
            <Input
              label="Guardian Phone"
              placeholder="Enter phone number"
              value={formData.guardianPhone}
              onChange={(e) => handleChange("guardianPhone", e.target.value)}
              startContent={<Phone size={18} className="text-default-400" />}
              isRequired
            />
          </CardBody>
        </Card>

        {/* Academic Details */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <BookOpen size={20} className="text-primary" />
              <h2 className="text-xl font-bold">Academic Details</h2>
            </div>
          </CardHeader>
          <Divider />
          <CardBody className="gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Class"
                placeholder="Select class"
                selectedKeys={formData.className ? [formData.className] : []}
                onChange={(e) => handleChange("className", e.target.value)}
                isRequired
              >
                {classes.map((cls) => (
                  <SelectItem key={cls}>{cls}</SelectItem>
                ))}
              </Select>

              <Select
                label="Board"
                placeholder="Select board"
                selectedKeys={formData.board ? [formData.board] : []}
                onChange={(e) => handleChange("board", e.target.value)}
                isRequired
              >
                {boards.map((board) => (
                  <SelectItem key={board}>{board}</SelectItem>
                ))}
              </Select>

              <Select
                label="Subject"
                placeholder="Select subject"
                selectedKeys={formData.subject ? [formData.subject] : []}
                onChange={(e) => handleChange("subject", e.target.value)}
                isRequired
              >
                {subjects.map((subject) => (
                  <SelectItem key={subject}>{subject}</SelectItem>
                ))}
              </Select>

              <Input
                label="Monthly Budget (₹)"
                placeholder="Enter budget"
                value={formData.budget}
                onChange={(e) => handleChange("budget", e.target.value)}
                startContent={
                  <FaRupeeSign size={18} className="text-default-400" />
                }
                type="number"
                isRequired
              />
            </div>
          </CardBody>
        </Card>

        {/* Schedule Details */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-bold">Schedule Details</h2>
          </CardHeader>
          <Divider />
          <CardBody className="gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Class Type"
                placeholder="Select class type"
                selectedKeys={formData.classType ? [formData.classType] : []}
                onChange={(e) => handleChange("classType", e.target.value)}
                isRequired
              >
                <SelectItem key="in-person">In-Person</SelectItem>
                <SelectItem key="online">Online</SelectItem>
                <SelectItem key="hybrid">Hybrid</SelectItem>
              </Select>

              <Select
                label="Frequency"
                placeholder="Select frequency"
                selectedKeys={formData.frequency ? [formData.frequency] : []}
                onChange={(e) => handleChange("frequency", e.target.value)}
                isRequired
              >
                <SelectItem key="one">1 day/week</SelectItem>
                <SelectItem key="two">2 days/week</SelectItem>
                <SelectItem key="three">3 days/week</SelectItem>
                <SelectItem key="four">4 days/week</SelectItem>
                <SelectItem key="five">5 days/week</SelectItem>
                <SelectItem key="six">6 days/week</SelectItem>
                <SelectItem key="daily">Daily</SelectItem>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-default-700 mb-2 block">
                Preferred Days
              </label>
              <CheckboxGroup
                value={formData.preferredDays}
                onChange={(value) => handleChange("preferredDays", value)}
                orientation="horizontal"
                className="gap-2"
              >
                {weekDays.map((day) => (
                  <Checkbox key={day} value={day}>
                    {day}
                  </Checkbox>
                ))}
              </CheckboxGroup>
            </div>
          </CardBody>
        </Card>

        {/* Location & Notes */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <MapPin size={20} className="text-primary" />
              <h2 className="text-xl font-bold">Location & Additional Info</h2>
            </div>
          </CardHeader>
          <Divider />
          <CardBody className="gap-4">
            <Input
              label="Location"
              placeholder="Enter location"
              value={formData.location}
              onChange={(e) => handleChange("location", e.target.value)}
              startContent={<MapPin size={18} className="text-default-400" />}
              isRequired
            />
            <Textarea
              label="Additional Notes"
              placeholder="Enter any additional notes or requirements..."
              value={formData.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              minRows={4}
            />
          </CardBody>
        </Card>

        {/* Status */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-bold">Post Status</h2>
          </CardHeader>
          <Divider />
          <CardBody>
            <Select
              label="Status"
              placeholder="Select status"
              selectedKeys={formData.status ? [formData.status] : []}
              onChange={(e) => handleChange("status", e.target.value)}
              isRequired
            >
              <SelectItem key="open">Open</SelectItem>
              <SelectItem key="closed">Closed</SelectItem>
              <SelectItem key="filled">Filled</SelectItem>
            </Select>
          </CardBody>
        </Card>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            color="default"
            variant="bordered"
            startContent={<X size={18} />}
            onPress={handleCancel}
          >
            Cancel
          </Button>
          <Button
            color="primary"
            startContent={<Save size={18} />}
            onPress={handleSave}
            isLoading={isSaving}
          >
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Input, Textarea } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Checkbox, CheckboxGroup } from "@heroui/checkbox";
import { Divider } from "@heroui/divider";
import { addToast } from "@heroui/toast";
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  BookOpen,
  User,
  Phone,
  MapPin,
} from "lucide-react";
import { FaRupeeSign } from "react-icons/fa";

interface StudentInput {
  className: string;
  board: string;
  subjects: string[];
}

const BOARDS = [
  "CBSE",
  "ICSE",
  "ISC",
  "IB",
  "WB-Bengali Version",
  "WB-English Version",
];

const CLASS_TYPES = [
  { key: "online", label: "Online" },
  { key: "offline", label: "In-Person" },
  { key: "both", label: "Both" },
];

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function TuitionPostForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [guardianName, setGuardianName] = useState("");
  const [guardianPhone, setGuardianPhone] = useState("");
  const [students, setStudents] = useState<StudentInput[]>([
    { className: "", board: "", subjects: [] },
  ]);
  const [classType, setClassType] = useState<string>("offline");
  const [frequencyPerWeek, setFrequencyPerWeek] = useState<string>("3");
  const [preferredDays, setPreferredDays] = useState<string[]>([]);
  const [preferredTime, setPreferredTime] = useState("");
  const [location, setLocation] = useState("");
  const [monthlyBudget, setMonthlyBudget] = useState("");
  const [notes, setNotes] = useState("");
  const [subjectInput, setSubjectInput] = useState<Record<number, string>>({});

  // Student management
  const addStudent = () => {
    setStudents([...students, { className: "", board: "", subjects: [] }]);
  };

  const removeStudent = (index: number) => {
    if (students.length <= 1) return;
    setStudents(students.filter((_, i) => i !== index));
  };

  const updateStudent = (
    index: number,
    field: keyof StudentInput,
    value: string | string[],
  ) => {
    const updated = [...students];
    updated[index] = { ...updated[index], [field]: value };
    setStudents(updated);
  };

  const addSubject = (studentIndex: number) => {
    const text = (subjectInput[studentIndex] || "").trim();
    if (!text) return;
    const current = students[studentIndex].subjects;
    if (!current.includes(text)) {
      updateStudent(studentIndex, "subjects", [...current, text]);
    }
    setSubjectInput({ ...subjectInput, [studentIndex]: "" });
  };

  const removeSubject = (studentIndex: number, subject: string) => {
    const current = students[studentIndex].subjects;
    updateStudent(
      studentIndex,
      "subjects",
      current.filter((s) => s !== subject),
    );
  };

  const handleSubmit = async () => {
    // Basic client-side validation
    if (!guardianName.trim()) {
      addToast({ description: "Guardian name is required", color: "danger" });
      return;
    }
    if (!guardianPhone.trim()) {
      addToast({ description: "Guardian phone is required", color: "danger" });
      return;
    }
    if (!preferredTime.trim()) {
      addToast({ description: "Preferred time is required", color: "danger" });
      return;
    }
    if (!location.trim()) {
      addToast({ description: "Location is required", color: "danger" });
      return;
    }
    if (preferredDays.length === 0) {
      addToast({
        description: "At least one preferred day is required",
        color: "danger",
      });
      return;
    }
    for (let i = 0; i < students.length; i++) {
      const s = students[i];
      if (!s.className.trim() || !s.board.trim() || s.subjects.length === 0) {
        addToast({
          description: `Please fill all fields for student ${i + 1}`,
          color: "danger",
        });
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const payload = {
        guardianName: guardianName.trim(),
        guardianPhone: guardianPhone.trim(),
        students: students.map((s) => ({
          className: s.className.trim(),
          board: s.board.trim(),
          subjects: s.subjects,
        })),
        classType,
        frequencyPerWeek: parseInt(frequencyPerWeek, 10),
        preferredDays,
        preferredTime: preferredTime.trim(),
        location: location.trim(),
        monthlyBudget: parseInt(monthlyBudget || "0", 10),
        notes: notes.trim() || undefined,
        status: "open" as const,
      };

      const res = await fetch("/api/v1/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        // Show field-level errors from Zod validation if available
        if (data.fieldErrors) {
          const messages = Object.entries(data.fieldErrors)
            .map(([field, errors]) => `${field}: ${(errors as string[]).join(", ")}`)
            .join("; ");
          throw new Error(messages || data.error || "Validation failed");
        }
        throw new Error(data.error || "Failed to create post");
      }

      const data = await res.json();
      addToast({
        description: `Post ${data.post.postId} created successfully!`,
        color: "success",
      });
      router.push("/admin/tuitions");
      router.refresh();
    } catch (error) {
      addToast({
        description:
          error instanceof Error ? error.message : "Failed to create post",
        color: "danger",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 w-full max-w-3xl">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button
            isIconOnly
            variant="light"
            onPress={() => router.push("/admin/tuitions")}
          >
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-default-900">
              Create Tuition Post
            </h1>
            <p className="text-default-500 text-sm">
              Fill in the details to create a new tuition post
            </p>
          </div>
        </div>

        {/* Guardian Details */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <User size={18} className="text-primary" />
              <h2 className="text-lg font-semibold">Guardian Details</h2>
            </div>
          </CardHeader>
          <CardBody className="gap-4">
            <Input
              label="Guardian Name"
              placeholder="Enter guardian's full name"
              value={guardianName}
              onChange={(e) => setGuardianName(e.target.value)}
              startContent={<User size={16} className="text-default-400" />}
              isRequired
              variant="bordered"
            />
            <Input
              label="Guardian Phone"
              placeholder="10-digit phone number"
              value={guardianPhone}
              onChange={(e) => setGuardianPhone(e.target.value)}
              startContent={<Phone size={16} className="text-default-400" />}
              isRequired
              variant="bordered"
              maxLength={10}
            />
          </CardBody>
        </Card>

        {/* Students */}
        <Card>
          <CardHeader className="pb-2 flex justify-between">
            <div className="flex items-center gap-2">
              <BookOpen size={18} className="text-primary" />
              <h2 className="text-lg font-semibold">
                Students ({students.length})
              </h2>
            </div>
            <Button
              size="sm"
              color="primary"
              variant="flat"
              startContent={<Plus size={16} />}
              onPress={addStudent}
            >
              Add Student
            </Button>
          </CardHeader>
          <CardBody className="gap-4">
            {students.map((student, idx) => (
              <Card key={idx} className="border border-default-200">
                <CardBody className="gap-3">
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-semibold text-default-700">
                      Student {idx + 1}
                    </p>
                    {students.length > 1 && (
                      <Button
                        isIconOnly
                        size="sm"
                        color="danger"
                        variant="light"
                        onPress={() => removeStudent(idx)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Class"
                      placeholder="e.g. 8, 10, 12"
                      value={student.className}
                      onChange={(e) =>
                        updateStudent(idx, "className", e.target.value)
                      }
                      isRequired
                      variant="bordered"
                    />
                    <Select
                      label="Board"
                      placeholder="Select board"
                      selectedKeys={student.board ? [student.board] : []}
                      onSelectionChange={(keys) => {
                        const key = Array.from(keys)[0] as string;
                        updateStudent(idx, "board", key || "");
                      }}
                      isRequired
                      variant="bordered"
                    >
                      {BOARDS.map((b) => (
                        <SelectItem key={b}>{b}</SelectItem>
                      ))}
                    </Select>
                  </div>
                  {/* Subjects */}
                  <div>
                    <div className="flex gap-2">
                      <Input
                        label="Subjects"
                        placeholder="Type and press Add"
                        value={subjectInput[idx] || ""}
                        onChange={(e) =>
                          setSubjectInput({
                            ...subjectInput,
                            [idx]: e.target.value,
                          })
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addSubject(idx);
                          }
                        }}
                        variant="bordered"
                      />
                      <Button
                        color="primary"
                        variant="flat"
                        className="mt-auto"
                        onPress={() => addSubject(idx)}
                      >
                        Add
                      </Button>
                    </div>
                    {student.subjects.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {student.subjects.map((sub) => (
                          <Chip
                            key={sub}
                            size="sm"
                            variant="flat"
                            color="primary"
                            onClose={() => removeSubject(idx, sub)}
                          >
                            {sub}
                          </Chip>
                        ))}
                      </div>
                    )}
                  </div>
                </CardBody>
              </Card>
            ))}
          </CardBody>
        </Card>

        {/* Schedule & Details */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <MapPin size={18} className="text-primary" />
              <h2 className="text-lg font-semibold">Schedule & Details</h2>
            </div>
          </CardHeader>
          <CardBody className="gap-4">
            <div className="grid grid-cols-2 gap-3">
              <Select
                label="Class Type"
                placeholder="Select type"
                selectedKeys={classType ? [classType] : []}
                onSelectionChange={(keys) => {
                  const key = Array.from(keys)[0] as string;
                  setClassType(key || "offline");
                }}
                isRequired
                variant="bordered"
              >
                {CLASS_TYPES.map((ct) => (
                  <SelectItem key={ct.key}>{ct.label}</SelectItem>
                ))}
              </Select>
              <Select
                label="Frequency (per week)"
                placeholder="Select frequency"
                selectedKeys={frequencyPerWeek ? [frequencyPerWeek] : []}
                onSelectionChange={(keys) => {
                  const key = Array.from(keys)[0] as string;
                  setFrequencyPerWeek(key || "3");
                }}
                isRequired
                variant="bordered"
              >
                {Array.from({ length: 7 }, (_, i) => (
                  <SelectItem key={String(i + 1)}>
                    {i + 1 === 7 ? "Daily" : `${i + 1} day${i > 0 ? "s" : ""}/week`}
                  </SelectItem>
                ))}
              </Select>
            </div>

            <div>
              <p className="text-sm font-medium text-default-700 mb-2">
                Preferred Days
              </p>
              <CheckboxGroup
                orientation="horizontal"
                value={preferredDays}
                onChange={(v) => setPreferredDays(v as string[])}
              >
                {DAYS_OF_WEEK.map((day) => (
                  <Checkbox key={day} value={day} size="sm">
                    {day.slice(0, 3)}
                  </Checkbox>
                ))}
              </CheckboxGroup>
            </div>

            <Input
              label="Preferred Time"
              placeholder="e.g. 5 PM - 7 PM, Evening"
              value={preferredTime}
              onChange={(e) => setPreferredTime(e.target.value)}
              isRequired
              variant="bordered"
            />

            <Input
              label="Location"
              placeholder="Enter full address"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              startContent={<MapPin size={16} className="text-default-400" />}
              isRequired
              variant="bordered"
            />

            <Input
              label="Monthly Budget"
              placeholder="e.g. 3000"
              type="number"
              value={monthlyBudget}
              onChange={(e) => setMonthlyBudget(e.target.value)}
              startContent={
                <FaRupeeSign size={14} className="text-default-400" />
              }
              variant="bordered"
            />

            <Textarea
              label="Notes (optional)"
              placeholder="Any additional requirements or preferences"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              variant="bordered"
              minRows={2}
              maxRows={5}
            />
          </CardBody>
        </Card>

        {/* Submit */}
        <div className="flex justify-end gap-3 pb-6">
          <Button
            variant="flat"
            onPress={() => router.push("/admin/tuitions")}
          >
            Cancel
          </Button>
          <Button
            color="primary"
            startContent={<Save size={16} />}
            isLoading={isSubmitting}
            onPress={handleSubmit}
          >
            Create Post
          </Button>
        </div>
      </div>
    </div>
  );
}

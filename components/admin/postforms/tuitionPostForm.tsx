"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardBody, CardFooter } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Input, Textarea } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { RadioGroup, Radio } from "@heroui/radio";
import { Checkbox, CheckboxGroup } from "@heroui/checkbox";
import { Button } from "@heroui/button";
import { addToast } from "@heroui/toast";
import { Spinner } from "@heroui/spinner";
import { NumberInput } from "@heroui/number-input";
import {
  BookOpen,
  User,
  Phone,
  DollarSign,
  Clock,
  MapPin,
  CheckCircle,
} from "lucide-react";
import { Autocomplete, AutocompleteItem } from "@heroui/autocomplete";
import { z } from "zod";
import Stepper, { Step } from "@/components/reactbits/ui/Stepper";
import { FaRupeeSign } from "react-icons/fa";
import { CustomCheckbox } from "@/components/ui/CustomCheckbox";
import { Enquiry } from "@/components/admin/enquiries/EnquiryCard";

type ClassType = "in-person" | "online" | "both";
type PreferredTime = "AM" | "PM";

// Zod validation schema
const studentSchema = z.object({
  class: z.string().min(1, "Class is required"),
  subject: z.string().min(1, "Subject is required"),
  board: z.string().min(1, "Board is required"),
});

const tuitionPostSchema = z.object({
  guardianName: z
    .string()
    .min(2, "Guardian name must be at least 2 characters")
    .max(50, "Guardian name must be at most 50 characters")
    .regex(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces"),
  guardianPhone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian phone number"),
  students: z.array(studentSchema).min(1, "At least one student is required"),
  missingSubjects: z.array(z.string()).optional(),
  remuneration: z.string().optional(),
  classType: z.enum(["in-person", "online", "both"]),
  frequency: z.string().optional(),
  preferredTime: z.enum(["AM", "PM"]),
  preferredDays: z.array(z.string()),
  preferredLocation: z.string().min(3, "Preferred location is required"),
  notes: z.string().optional(),
});

const subjects = [
  { key: "mathematics", label: "Mathematics" },
  { key: "science", label: "Science" },
  { key: "english", label: "English" },
  { key: "hindi", label: "Hindi" },
  { key: "social-studies", label: "Social Studies" },
  { key: "physics", label: "Physics" },
  { key: "chemistry", label: "Chemistry" },
  { key: "biology", label: "Biology" },
  { key: "computer-science", label: "Computer Science" },
];

const boards = [
  { key: "cbse", label: "CBSE" },
  { key: "icse", label: "ICSE" },
  { key: "ib", label: "IB" },
  { key: "state", label: "State Board" },
];

const classes = [
  { key: "1", label: "Class 1" },
  { key: "2", label: "Class 2" },
  { key: "3", label: "Class 3" },
  { key: "4", label: "Class 4" },
  { key: "5", label: "Class 5" },
  { key: "6", label: "Class 6" },
  { key: "7", label: "Class 7" },
  { key: "8", label: "Class 8" },
  { key: "9", label: "Class 9" },
  { key: "10", label: "Class 10" },
  { key: "11", label: "Class 11" },
  { key: "12", label: "Class 12" },
];

const frequencies = [
  { key: "1", label: "1 day/week" },
  { key: "2", label: "2 days/week" },
  { key: "3", label: "3 days/week" },
  { key: "4", label: "4 days/week" },
  { key: "5", label: "5 days/week" },
  { key: "6", label: "6 days/week" },
  { key: "7", label: "Everyday" },
];

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface TuitionPostFormProps {
  mode?: "create" | "edit";
  postId?: string;
  enquiry?: Enquiry | null;
}

export default function TuitionPostForm({
  mode = "create",
  postId,
  enquiry,
}: TuitionPostFormProps) {
  const router = useRouter();
  const isEditMode = mode === "edit";
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [notFound, setNotFound] = useState(false);
  const [formData, setFormData] = useState({
    guardianName: "",
    guardianPhone: "",
    students: [{ class: "", subject: "", board: "" }],
    missingSubjects: [] as string[],
    remuneration: "",
    classType: "in-person" as ClassType,
    frequency: "",
    preferredTime: "AM" as PreferredTime,
    preferredDays: [] as string[],
    preferredLocation: "",
    notes: "",
    status: "open",
  });
  const [missingSubjectInput, setMissingSubjectInput] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);

  // Fetch post data for edit mode
  useEffect(() => {
    if (!isEditMode || !postId) return;
    const fetchPost = async () => {
      try {
        const res = await fetch(`/api/v1/posts/${postId}`);
        if (!res.ok) {
          setNotFound(true);
          return;
        }
        const { post } = await res.json();
        const classTypeReverseMap: Record<string, ClassType> = {
          offline: "in-person",
          online: "online",
          both: "both",
        };
        setFormData({
          guardianName: post.guardianName || "",
          guardianPhone: post.guardianPhone || "",
          students: post.students?.length
            ? post.students.map((s: any) => ({
                class: s.className || "",
                subject: s.subjects?.[0] || "",
                board: s.board || "",
              }))
            : [{ class: "", subject: "", board: "" }],
          missingSubjects: [],
          remuneration: post.monthlyBudget?.toString() || "",
          classType: classTypeReverseMap[post.classType] || "in-person",
          frequency: post.frequencyPerWeek?.toString() || "",
          preferredTime: (post.preferredTime || "AM") as PreferredTime,
          preferredDays: post.preferredDays || [],
          preferredLocation: post.location || "",
          notes: post.notes || "",
          status: post.status || "open",
        });
      } catch {
        setNotFound(true);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPost();
  }, [isEditMode, postId]);

  // Pre-fill form data from enquiry if available (create mode only)
  useEffect(() => {
    if (isEditMode || !enquiry) return;
    setFormData((prev) => ({
      ...prev,
      guardianName: enquiry.name || "",
      guardianPhone: enquiry.phoneNumber || "",
      notes: enquiry.query ? `From enquiry: ${enquiry.query}` : "",
    }));
  }, [enquiry, isEditMode]);
  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleStudentChange = (index: number, field: string, value: string) => {
    const newStudents = [...formData.students];
    newStudents[index] = { ...newStudents[index], [field]: value };
    setFormData((prev) => ({ ...prev, students: newStudents }));

    // Clear error for this student field
    const errorKey = `students.${index}.${field}`;
    if (errors[errorKey]) {
      setErrors((prev) => ({ ...prev, [errorKey]: "" }));
    }
  };

  const addStudent = () => {
    setFormData((prev) => ({
      ...prev,
      students: [...prev.students, { class: "", subject: "", board: "" }],
    }));
  };

  const removeStudent = (index: number) => {
    if (formData.students.length > 1) {
      const newStudents = formData.students.filter((_, i) => i !== index);
      setFormData((prev) => ({ ...prev, students: newStudents }));
    }
  };

  const addMissingSubject = () => {
    if (missingSubjectInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        missingSubjects: [...prev.missingSubjects, missingSubjectInput.trim()],
      }));
      setMissingSubjectInput("");
    }
  };

  const removeMissingSubject = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      missingSubjects: prev.missingSubjects.filter((_, i) => i !== index),
    }));
  };

  const validate = () => {
    try {
      tuitionPostSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.issues.forEach((issue) => {
          const path = issue.path.join(".");
          newErrors[path] = issue.message;
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  // Step-by-step validation
  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    try {
      switch (step) {
        case 1: // Guardian Details
          const step1Schema = z.object({
            guardianName: tuitionPostSchema.shape.guardianName,
            guardianPhone: tuitionPostSchema.shape.guardianPhone,
          });
          step1Schema.parse({
            guardianName: formData.guardianName,
            guardianPhone: formData.guardianPhone,
          });
          break;

        case 2: // Student Details
          const step2Schema = z.object({
            students: tuitionPostSchema.shape.students,
          });
          step2Schema.parse({
            students: formData.students,
          });
          break;

        case 3: // Schedule & Preferences
          const step3Schema = z.object({
            classType: tuitionPostSchema.shape.classType,
            preferredTime: tuitionPostSchema.shape.preferredTime,
            preferredDays: tuitionPostSchema.shape.preferredDays,
          });
          step3Schema.parse({
            classType: formData.classType,
            preferredTime: formData.preferredTime,
            preferredDays: formData.preferredDays,
          });
          break;        case 4: // Location & Notes (final step)
          const step4Schema = z.object({
            preferredLocation: tuitionPostSchema.shape.preferredLocation,
          });
          step4Schema.parse({
            preferredLocation: formData.preferredLocation,
          });
          break;

        case 5: // Review step (no validation needed)
          return true;

        default:
          return true;
      }

      // Clear errors for this step if validation passes
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        error.issues.forEach((issue) => {
          const path = issue.path.join(".");
          newErrors[path] = issue.message;
        });
        setErrors(newErrors);
        isValid = false;
      }

      // Show toast message
      addToast({
        description: "Please fill in all required fields correctly",
        color: "danger",
      });

      return isValid;
    }
  };
  const handleSubmit = async () => {
    setIsSubmitting(true);
    if (!validate()) {
      addToast({ description: "Please fix the errors", color: "danger" });
      setIsSubmitting(false);
      return;
    }

    try {
      // Map classType: "in-person" → "offline" for the API
      const classTypeMap: Record<string, string> = {
        "in-person": "offline",
        online: "online",
        both: "both",
      };

      // Map students: each entry becomes a student with subjects as single-item array
      const mappedStudents = formData.students.map((s) => ({
        className: s.class.trim(),
        board: s.board.trim(),
        subjects: [s.subject.trim()],
      }));

      const payload: Record<string, unknown> = {
        guardianName: formData.guardianName.trim(),
        guardianPhone: formData.guardianPhone.trim(),
        students: mappedStudents,
        classType: classTypeMap[formData.classType] || "offline",
        frequencyPerWeek: parseInt(formData.frequency || "3", 10),
        preferredDays: formData.preferredDays,
        preferredTime: formData.preferredTime,
        location: formData.preferredLocation.trim(),
        monthlyBudget: parseInt(formData.remuneration || "0", 10),
        status: "open" as const,
      };

      // Optional fields
      const notesParts: string[] = [];
      if (formData.notes?.trim()) notesParts.push(formData.notes.trim());
      if (formData.missingSubjects.length > 0)
        notesParts.push(
          `Missing subjects: ${formData.missingSubjects.join(", ")}`
        );
      if (notesParts.length > 0) payload.notes = notesParts.join("\n");

      // Include enquiryId if available (create mode only)
      if (!isEditMode && enquiry?._id) payload.enquiryId = enquiry._id;

      // Include status for edit mode
      if (isEditMode) payload.status = formData.status;

      const url = isEditMode ? `/api/v1/posts/${postId}` : "/api/v1/posts";
      const res = await fetch(url, {
        method: isEditMode ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        if (data.fieldErrors) {
          const messages = Object.entries(data.fieldErrors)
            .map(
              ([field, errors]) =>
                `${field}: ${(errors as string[]).join(", ")}`
            )
            .join("; ");
          throw new Error(messages || data.error || "Validation failed");
        }
        throw new Error(
          data.error ||
            (isEditMode ? "Failed to update post" : "Failed to create post")
        );
      }

      const data = await res.json();

      // Show success animation
      setShowSuccess(true);
      addToast({
        description: isEditMode
          ? "Tuition post updated successfully!"
          : `Post ${data.post.postId} created successfully!`,
        color: "success",
      });

      // Navigate after showing success
      setTimeout(() => {
        router.push(
          isEditMode ? `/admin/tuitions/${postId}` : "/admin/tuitions"
        );
        router.refresh();
      }, 2000);
    } catch (error) {
      addToast({
        description:
          error instanceof Error
          ? error.message
          : isEditMode
            ? "Failed to update post"
            : "Failed to create post",
        color: "danger",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Edit mode: loading state
  if (isEditMode && isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  // Edit mode: not found state
  if (isEditMode && notFound) {
    return (
      <div className="w-full max-w-3xl mx-auto p-3 text-center">
        <p className="text-danger text-lg">Post not found</p>
        <Button
          variant="light"
          className="mt-4"
          onPress={() => router.push("/admin/tuitions")}
        >
          Back to Tuitions
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen max-w-3xl mx-auto p-3">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 justify-center">
          <h3 className="text-xl font-bold">
            {isEditMode ? "Edit Tuition" : "Create Tuition"}
          </h3>
        </div>
        <p className="text-sm text-default-500 text-center">
          {isEditMode ? "Update the details below" : "Fill in the details"}
        </p>
      </div>
      {showSuccess ? (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-success/20 flex items-center justify-center animate-in zoom-in duration-500">
              <CheckCircle
                size={64}
                className="text-success animate-in zoom-in duration-700 delay-200"
              />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-success animate-in fade-in duration-500 delay-300">
            {isEditMode ? "Tuition Post Updated!" : "Tuition Post Created!"}
          </h3>
          <p className="text-default-500 animate-in fade-in duration-500 delay-400">
            {isEditMode
              ? "Your tuition post has been successfully updated."
              : "Your tuition post has been successfully created."}
          </p>
        </div>
      ) : isSubmitting ? (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <Spinner size="lg" color="primary" />
          <p className="text-default-500">
            {isEditMode ? "Updating tuition post..." : "Creating tuition post..."}
          </p>
        </div>
      ) : (
      <div className="flex justify-center">
        <Stepper
          onFinalStepCompleted={handleSubmit}
          validateStep={validateStep}
          nextButtonText="Next Step"
          backButtonText="Previous"
        >
          {/* Step 1: Guardian Details */}
          <Step>
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-default-700">
                Guardian Details
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Guardian Name"
                  placeholder="Enter guardian name"
                  value={formData.guardianName}
                  onChange={(e) => handleChange("guardianName", e.target.value)}
                  isRequired
                  isInvalid={!!errors.guardianName}
                  errorMessage={errors.guardianName}
                  variant="bordered"
                  startContent={<User size={18} className="text-default-400" />}
                />{" "}
                <Input
                  label="Guardian Phone"
                  placeholder="Enter phone number"
                  type="tel"
                  value={formData.guardianPhone}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    if (value.length <= 10) {
                      handleChange("guardianPhone", value);
                    }
                  }}
                  isRequired
                  isInvalid={!!errors.guardianPhone}
                  errorMessage={errors.guardianPhone}
                  variant="bordered"
                  startContent={
                    <Phone size={18} className="text-default-400" />
                  }
                  maxLength={10}
                />
              </div>
            </div>
          </Step>

          {/* Step 2: Student Details */}
          <Step>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold text-default-700">
                  Student Details
                </h4>
                <Button
                  size="sm"
                  color="primary"
                  variant="flat"
                  onPress={addStudent}
                  startContent={<span className="text-lg">+</span>}
                >
                  Add Student
                </Button>
              </div>
              {formData.students.map((student, index) => (
                <Card key={index} className="p-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-default-700">
                        Student {index + 1}
                      </p>
                      {formData.students.length > 1 && (
                        <Button
                          size="sm"
                          color="danger"
                          variant="light"
                          onPress={() => removeStudent(index)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Autocomplete
                        label="Class"
                        placeholder="Search class"
                        selectedKey={student.class}
                        onSelectionChange={(key) =>
                          handleStudentChange(index, "class", key as string)
                        }
                        isRequired
                        isInvalid={!!errors[`students.${index}.class`]}
                        errorMessage={errors[`students.${index}.class`]}
                        variant="bordered"
                      >
                        {classes.map((cls) => (
                          <AutocompleteItem key={cls.key}>
                            {cls.label}
                          </AutocompleteItem>
                        ))}
                      </Autocomplete>

                      <Autocomplete
                        label="Subject"
                        placeholder="Search subject"
                        selectedKey={student.subject}
                        onSelectionChange={(key) =>
                          handleStudentChange(index, "subject", key as string)
                        }
                        isRequired
                        isInvalid={!!errors[`students.${index}.subject`]}
                        errorMessage={errors[`students.${index}.subject`]}
                        variant="bordered"
                      >
                        {subjects.map((sub) => (
                          <AutocompleteItem key={sub.key}>
                            {sub.label}
                          </AutocompleteItem>
                        ))}
                      </Autocomplete>

                      <Autocomplete
                        label="Board"
                        placeholder="Search board"
                        selectedKey={student.board}
                        onSelectionChange={(key) =>
                          handleStudentChange(index, "board", key as string)
                        }
                        isRequired
                        isInvalid={!!errors[`students.${index}.board`]}
                        errorMessage={errors[`students.${index}.board`]}
                        variant="bordered"
                      >
                        {boards.map((board) => (
                          <AutocompleteItem key={board.key}>
                            {board.label}
                          </AutocompleteItem>
                        ))}
                      </Autocomplete>
                    </div>
                  </div>
                </Card>
              ))}
              {/* Missing Subjects Section */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-default-700">
                  Missing Subjects (if any)
                </label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter missing subject name"
                    value={missingSubjectInput}
                    onChange={(e) => setMissingSubjectInput(e.target.value)}
                    variant="bordered"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addMissingSubject();
                      }
                    }}
                  />
                  <Button
                    color="primary"
                    variant="flat"
                    onPress={addMissingSubject}
                    isDisabled={!missingSubjectInput.trim()}
                  >
                    Add
                  </Button>
                </div>

                {formData.missingSubjects.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.missingSubjects.map((subject, index) => (
                      <div
                        key={index}
                        className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm flex items-center gap-2"
                      >
                        {subject}
                        <button
                          type="button"
                          onClick={() => removeMissingSubject(index)}
                          className="hover:text-danger"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>{" "}
              <Input
                label="Remuneration (/month)"
                placeholder="e.g. 5000"
                type="tel"
                value={formData.remuneration}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  handleChange("remuneration", value);
                }}
                variant="bordered"
                startContent={
                  <FaRupeeSign size={18} className="text-default-400" />
                }
                description="Enter amount in numbers only"
              />
            </div>
          </Step>

          {/* Step 3: Schedule & Preferences */}
          <Step>
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-default-700">
                Schedule & Preferences
              </h4>
              {/* Class Type */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-default-700">
                  Class Type
                </label>
                <RadioGroup
                  value={formData.classType}
                  onValueChange={(value) => handleChange("classType", value)}
                  orientation="horizontal"
                >
                  <Radio value="in-person">In-Person</Radio>
                  <Radio value="online">Online</Radio>
                  <Radio value="both">Both</Radio>
                </RadioGroup>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Frequency"
                  placeholder="Select frequency"
                  selectedKeys={formData.frequency ? [formData.frequency] : []}
                  onChange={(e: any) =>
                    handleChange("frequency", e.target.value)
                  }
                  variant="bordered"
                  startContent={
                    <Clock size={18} className="text-default-400" />
                  }
                >
                  {frequencies.map((freq) => (
                    <SelectItem key={freq.key}>{freq.label}</SelectItem>
                  ))}
                </Select>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-default-700">
                    Preferred Time
                  </label>
                  <RadioGroup
                    value={formData.preferredTime}
                    onValueChange={(value) =>
                      handleChange("preferredTime", value)
                    }
                    orientation="horizontal"
                  >
                    <Radio value="AM">AM</Radio>
                    <Radio value="PM">PM</Radio>
                  </RadioGroup>
                </div>
              </div>{" "}
              <div className="space-y-2">
                <label className="text-sm font-medium text-default-700">
                  Preferred Days
                </label>
                <CheckboxGroup
                  className="gap-1"
                  value={formData.preferredDays}
                  onValueChange={(value) =>
                    handleChange("preferredDays", value)
                  }
                  orientation="horizontal"
                  classNames={{ wrapper: "gap-3" }}
                >
                  {/* <div className="w-full grid grid-cols-4 items-center justify-center gap-2"> */}
                  {days.map((day) => (
                    <CustomCheckbox key={day} value={day}>
                      {day}
                    </CustomCheckbox>
                  ))}
                  {/* </div> */}
                </CheckboxGroup>
              </div>
            </div>
          </Step>

          {/* Step 4: Location & Notes */}
          <Step>
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-default-700">
                Location & Additional Information
              </h4>

              <Input
                label="Preferred Location"
                placeholder="Enter location/address"
                value={formData.preferredLocation}
                onChange={(e) =>
                  handleChange("preferredLocation", e.target.value)
                }
                isRequired
                isInvalid={!!errors.preferredLocation}
                errorMessage={errors.preferredLocation}
                variant="bordered"
                startContent={<MapPin size={18} className="text-default-400" />}
              />              <Textarea
                label="Additional Notes"
                placeholder="Any additional requirements or information..."
                value={formData.notes}
                onChange={(e: any) => handleChange("notes", e.target.value)}
                variant="bordered"
                minRows={4}
              />

              {isEditMode && (
                <Select
                  label="Post Status"
                  placeholder="Select status"
                  selectedKeys={formData.status ? [formData.status] : []}
                  onChange={(e: any) => handleChange("status", e.target.value)}
                  variant="bordered"
                  isRequired
                >
                  <SelectItem key="open">Open</SelectItem>
                  <SelectItem key="matched">Matched</SelectItem>
                  <SelectItem key="closed">Closed</SelectItem>
                  <SelectItem key="cancelled">Cancelled</SelectItem>
                  <SelectItem key="hold">Hold</SelectItem>
                </Select>
              )}
            </div>
          </Step>

          {/* Step 5: Review & Confirm */}
          <Step>
            <div className="space-y-4">
                <>
                  <h4 className="text-lg font-semibold text-default-700">
                    Review Your Tuition Post
                  </h4>

                  <Card>
                    <CardBody className="gap-4">
                      {/* Guardian Information */}
                      <div>
                        <p className="text-sm font-semibold text-default-700 mb-2">
                          Guardian Information
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="text-default-500">Name:</span>{" "}
                            <span className="font-medium">
                              {formData.guardianName}
                            </span>
                          </div>
                          <div>
                            <span className="text-default-500">Phone:</span>{" "}
                            <span className="font-medium">
                              {formData.guardianPhone}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-divider" />

                      {/* Students Information */}
                      <div>
                        <p className="text-sm font-semibold text-default-700 mb-2">
                          Students ({formData.students.length})
                        </p>
                        <div className="space-y-3">
                          {formData.students.map((student, index) => (
                            <Card key={index} className="bg-default-50">
                              <CardBody className="py-2 px-3">
                                <p className="text-xs font-semibold text-default-600 mb-1">
                                  Student {index + 1}
                                </p>
                                <div className="grid grid-cols-3 gap-2 text-xs">
                                  <div>
                                    <span className="text-default-500">
                                      Class:
                                    </span>{" "}
                                    <Chip size="sm" variant="flat">
                                      {student.class}
                                    </Chip>
                                  </div>
                                  <div>
                                    <span className="text-default-500">
                                      Subject:
                                    </span>{" "}
                                    <span className="font-medium">
                                      {student.subject}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-default-500">
                                      Board:
                                    </span>{" "}
                                    <span className="font-medium">
                                      {student.board}
                                    </span>
                                  </div>
                                </div>
                              </CardBody>
                            </Card>
                          ))}
                        </div>
                        {formData.missingSubjects.length > 0 && (
                          <div className="mt-2">
                            <span className="text-default-500 text-sm">
                              Missing Subjects:
                            </span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {formData.missingSubjects.map((subject, idx) => (
                                <Chip
                                  key={idx}
                                  size="sm"
                                  variant="flat"
                                  color="warning"
                                >
                                  {subject}
                                </Chip>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="border-t border-divider" />

                      {/* Schedule & Preferences */}
                      <div>
                        <p className="text-sm font-semibold text-default-700 mb-2">
                          Schedule & Preferences
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="text-default-500">
                              Class Type:
                            </span>{" "}
                            <Chip
                              size="sm"
                              variant="flat"
                              color="primary"
                              className="capitalize"
                            >
                              {formData.classType}
                            </Chip>
                          </div>
                          {formData.frequency && (
                            <div>
                              <span className="text-default-500">
                                Frequency:
                              </span>{" "}
                              <span className="font-medium">
                                {frequencies.find(
                                  (f) => f.key === formData.frequency
                                )?.label || formData.frequency}
                              </span>
                            </div>
                          )}
                          <div>
                            <span className="text-default-500">
                              Preferred Time:
                            </span>{" "}
                            <Chip size="sm" variant="flat" color="secondary">
                              {formData.preferredTime}
                            </Chip>
                          </div>
                          {formData.remuneration && (
                            <div>
                              <span className="text-default-500">
                                Remuneration:
                              </span>{" "}
                              <span className="font-medium text-success">
                                ₹{formData.remuneration}/month
                              </span>
                            </div>
                          )}
                        </div>
                        {formData.preferredDays.length > 0 && (
                          <div className="mt-2">
                            <span className="text-default-500 text-sm">
                              Preferred Days:
                            </span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {formData.preferredDays.map((day, idx) => (
                                <Chip
                                  key={idx}
                                  size="sm"
                                  variant="flat"
                                  color="primary"
                                >
                                  {day}
                                </Chip>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="border-t border-divider" />

                      {/* Location */}
                      <div>
                        <p className="text-sm font-semibold text-default-700 mb-2">
                          Location
                        </p>
                        <p className="text-sm text-default-600">
                          {formData.preferredLocation}
                        </p>
                      </div>

                      {formData.notes && (
                        <>
                          <div className="border-t border-divider" />
                          <div>
                            <p className="text-sm font-semibold text-default-700 mb-2">
                              Additional Notes
                            </p>
                            <p className="text-sm text-default-600">
                              {formData.notes}
                            </p>
                          </div>
                        </>
                      )}
                    </CardBody>
                  </Card>

                  <div className="bg-warning/10 p-4 rounded-lg border border-warning/20">
                    <p className="text-sm text-warning-700">
                      <strong>Note:</strong> Please review all information
                      carefully before confirming. Once submitted, the tuition
                      post will be {isEditMode ? "updated" : "created"}.
                    </p>
                  </div>
                </>
            </div>
          </Step>
        </Stepper>
      </div>
      )}
    </div>
  );
}

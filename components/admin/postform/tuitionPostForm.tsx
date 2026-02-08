"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardBody, CardFooter } from "@heroui/card";
import { Input, Textarea } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { RadioGroup, Radio } from "@heroui/radio";
import { Checkbox, CheckboxGroup } from "@heroui/checkbox";
import { Button } from "@heroui/button";
import { addToast } from "@heroui/toast";
import { NumberInput } from "@heroui/number-input";
import { BookOpen, User, Phone, DollarSign, Clock, MapPin } from "lucide-react";
import { Autocomplete, AutocompleteItem } from "@heroui/autocomplete";
import { z } from "zod";
import Stepper, { Step } from "@/components/reactbits/ui/Stepper";
import { FaRupeeSign } from "react-icons/fa";
import { CustomCheckbox } from "@/components/ui/CustomCheckbox";

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

export default function TuitionPostForm() {
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
  });

  const [missingSubjectInput, setMissingSubjectInput] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});
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
          break;

        case 4: // Location & Notes (final step)
          const step4Schema = z.object({
            preferredLocation: tuitionPostSchema.shape.preferredLocation,
          });
          step4Schema.parse({
            preferredLocation: formData.preferredLocation,
          });
          break;

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

  const handleSubmit = () => {
    if (!validate()) {
      addToast({ description: "Please fix the errors", color: "danger" });
      return;
    } // Debug log - show all form data
    console.log("=== TUITION POST SUBMISSION DEBUG ===");
    console.log("Timestamp:", new Date().toISOString());
    console.log("Form Data:", JSON.stringify(formData, null, 2));
    console.log("Guardian Name:", formData.guardianName);
    console.log("Guardian Phone:", formData.guardianPhone);
    console.log("Students:", formData.students);
    console.log("Missing Subjects:", formData.missingSubjects);
    console.log("Remuneration:", formData.remuneration || "Not specified");
    console.log("Class Type:", formData.classType);
    console.log("Frequency/Week:", formData.frequency || "Not specified");
    console.log("Preferred Time:", formData.preferredTime);
    console.log("Preferred Days:", formData.preferredDays);
    console.log("Preferred Location:", formData.preferredLocation);
    console.log("Additional Notes:", formData.notes || "None");
    console.log("=====================================");

    addToast({
      description: "Tuition post created successfully",
      color: "success",
    });

    // Reset form
    setFormData({
      guardianName: "",
      guardianPhone: "",
      students: [{ class: "", subject: "", board: "" }],
      missingSubjects: [],
      remuneration: "",
      classType: "in-person",
      frequency: "",
      preferredTime: "AM",
      preferredDays: [],
      preferredLocation: "",
      notes: "",
    });
  };
  return (
    <div className="w-full min-h-screen max-w-3xl mx-auto p-3">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 justify-center">
          {/* <BookOpen className="text-primary" size={24} /> */}
          <h3 className="text-xl font-bold">Create Tuition</h3>
        </div>
        <p className="text-sm text-default-500 text-center">
          Fill in the details
        </p>
      </div>
      <div>
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
                placeholder="e.g., 5000/month"
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
              />

              <Textarea
                label="Additional Notes"
                placeholder="Any additional requirements or information..."
                value={formData.notes}
                onChange={(e: any) => handleChange("notes", e.target.value)}
                variant="bordered"
                minRows={4}
              />

              <div className="bg-primary/10 p-4 rounded-lg">
                <p className="text-sm text-default-700 font-medium mb-2">
                  Review Your Information
                </p>
                <div className="text-xs space-y-1 text-default-600">
                  <p>Guardian: {formData.guardianName || "Not provided"}</p>
                  <p>Phone: {formData.guardianPhone || "Not provided"}</p>
                  <p>Students: {formData.students.length}</p>
                  <p>
                    Location: {formData.preferredLocation || "Not provided"}
                  </p>
                </div>
              </div>
            </div>
          </Step>
        </Stepper>
      </div>
    </div>
  );
}

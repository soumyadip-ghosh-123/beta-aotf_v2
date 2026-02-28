/**
 * lib/validations/forms.ts
 *
 * Client-side form validation schemas and associated constants.
 * Import these in form components AND API routes so validation
 * logic is never duplicated.
 */

import { z } from "zod";

// ─────────────────────────────────────────────────────────────────────────────
// SHARED OPTION CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

export const subjects = [
  { key: "mathematics", label: "Mathematics" },
  { key: "science", label: "Science" },
  { key: "english", label: "English" },
  { key: "hindi", label: "Hindi" },
  { key: "social-studies", label: "Social Studies" },
  { key: "physics", label: "Physics" },
  { key: "chemistry", label: "Chemistry" },
  { key: "biology", label: "Biology" },
  { key: "computer-science", label: "Computer Science" },
] as const;

export const boards = [
  { key: "cbse", label: "CBSE" },
  { key: "icse", label: "ICSE" },
  { key: "ib", label: "IB" },
  { key: "state", label: "State Board" },
] as const;

export const classes = [
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
] as const;

export const frequencies = [
  { key: "1", label: "1 day/week" },
  { key: "2", label: "2 days/week" },
  { key: "3", label: "3 days/week" },
  { key: "4", label: "4 days/week" },
  { key: "5", label: "5 days/week" },
  { key: "6", label: "6 days/week" },
  { key: "7", label: "Everyday" },
] as const;

/** Ordered Mon → Sun */
export const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

export const companyTypes = [
  { key: "individual", label: "Individual" },
  { key: "company", label: "Company" },
] as const;

export const workTypes = [
  { key: "job", label: "Job" },
  { key: "project", label: "Project" },
] as const;

export const commissionBasisTypes = [
  { key: "first_month", label: "First Month Salary" },
  { key: "project_value", label: "Project Value" },
] as const;

export const projectTypes = [
  { key: "one-time", label: "One-Time" },
  { key: "ongoing", label: "Ongoing" },
] as const;

export const experienceLevels = [
  { key: "0-1", label: "0-1 years (Fresher)" },
  { key: "1-3", label: "1-3 years" },
  { key: "3-5", label: "3-5 years" },
  { key: "5-10", label: "5-10 years" },
  { key: "10+", label: "10+ years" },
] as const;

// ─────────────────────────────────────────────────────────────────────────────
// TUITION POST FORM SCHEMAS
// ─────────────────────────────────────────────────────────────────────────────

export const studentFormSchema = z.object({
  class: z.string().min(1, "Class is required"),
  subject: z.string().min(1, "Subject is required"),
  board: z.string().min(1, "Board is required"),
});

export const tuitionFormSchema = z.object({
  guardianName: z
    .string()
    .min(2, "Guardian name must be at least 2 characters")
    .max(50, "Guardian name must be at most 50 characters")
    .regex(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces"),
  guardianPhone: z.string().min(1, "Phone number is required"),
  students: z
    .array(studentFormSchema)
    .min(1, "At least one student is required"),
  missingSubjects: z.array(z.string()).optional(),
  remuneration: z.string().optional(),
  classType: z.enum(["in-person", "online", "both"]),
  frequency: z.string().optional(),
  preferredTime: z.string().optional(),
  preferredDays: z.array(z.string()).optional(),
  preferredLocation: z.string().min(3, "Preferred location is required"),
  notes: z.string().optional(),
});

export type StudentFormValues = z.infer<typeof studentFormSchema>;
export type TuitionFormValues = z.infer<typeof tuitionFormSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// JOB POST FORM SCHEMA
// ─────────────────────────────────────────────────────────────────────────────

export const jobFormSchema = z.object({
  workType: z.enum(["job", "project"]),
  clientName: z
    .string()
    .min(2, "Client name must be at least 2 characters")
    .max(50, "Client name must be at most 50 characters")
    .regex(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces"),
  clientPhone: z.string().min(1, "Phone number is required"),
  companyName: z.string().optional(),
  companyType: z.enum(["individual", "company"]).optional(),
  designation: z.string().min(2, "Designation is required"),
  experience: z.string().optional(),
  locationType: z.enum(["on-site", "remote", "hybrid"]),
  location: z.string().min(3, "Location is required"),
  genderPreference: z.enum(["male", "female", "both", "all", "others"]),
  timing: z.string().optional(),
  salary: z.string().optional(),
  travelRequirements: z.string().optional(),
  requiredQualifications: z.string().optional(),
  skillsRequired: z.string().optional(),
  notes: z.string().optional(),
  commissionBasis: z.enum(["first_month", "project_value"]),
  academyCommissionPercentage: z.coerce
    .number()
    .int("Commission percentage must be a whole number")
    .min(0, "Commission percentage cannot be negative")
    .max(100, "Commission percentage cannot exceed 100"),
  projectType: z.enum(["one-time", "ongoing"]).optional(),
  budget: z.string().optional(),
  duration: z.string().optional(),
});

export type JobFormValues = z.infer<typeof jobFormSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// ENQUIRY FORM SCHEMA
// ─────────────────────────────────────────────────────────────────────────────

export const enquiryFormSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be at most 50 characters")
    .regex(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces"),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian phone number"),
  query: z.string().min(1, "Please enter your query"),
});

export type EnquiryFormValues = z.infer<typeof enquiryFormSchema>;

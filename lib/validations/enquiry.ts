import { z } from "zod";
import { ENQUIRY_STATUSES } from "@/lib/models/Enquiry";
import { ADMIN_ROLES } from "@/lib/models/EnqStatus";

// ─── User-facing: submit a new enquiry ─────────────────────────────────
export const createEnquirySchema = z.object({
  name: z
    .string({ required_error: "Name is required" })
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be at most 50 characters")
    .regex(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces"),

  phoneNumber: z
    .string({ required_error: "Phone number is required" })
    .trim()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian phone number"),

  query: z
    .string({ required_error: "Query is required" })
    .trim()
    .min(1, "Please enter your query")
    .max(2000, "Query must be at most 2000 characters"),
});

export type CreateEnquiryInput = z.infer<typeof createEnquirySchema>;

// ─── Admin-facing: update enquiry status ────────────────────────────────
export const updateStatusSchema = z.object({
  toStatus: z.enum(ENQUIRY_STATUSES, {
    errorMap: () => ({
      message: `Status must be one of: ${ENQUIRY_STATUSES.join(", ")}`,
    }),
  }),

  action: z
    .string({ required_error: "Action description is required" })
    .trim()
    .min(1, "Action description is required")
    .max(500, "Action must be at most 500 characters"),

  notes: z
    .string()
    .trim()
    .max(2000, "Notes must be at most 2000 characters")
    .optional(),

  adminId: z
    .string({ required_error: "Admin ID is required" })
    .min(1, "Admin ID is required"),

  adminName: z
    .string({ required_error: "Admin name is required" })
    .trim()
    .min(1, "Admin name is required"),

  adminRole: z.enum(ADMIN_ROLES, {
    errorMap: () => ({
      message: `Admin role must be one of: ${ADMIN_ROLES.join(", ")}`,
    }),
  }),
});

export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;

// ─── Admin-facing: list enquiries query params ──────────────────────────
export const listEnquiriesSchema = z.object({
  status: z
    .enum([...ENQUIRY_STATUSES, "all"])
    .optional()
    .default("all"),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export type ListEnquiriesInput = z.infer<typeof listEnquiriesSchema>;

// ─── Shared: MongoDB ObjectId path param ────────────────────────────────
export const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid document ID");

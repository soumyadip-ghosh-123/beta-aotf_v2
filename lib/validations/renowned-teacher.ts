import { z } from "zod";

export const createRenownedTeacherSchema = z.object({
  name: z
    .string({ message: "Name is required" })
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(200, "Name must be at most 200 characters"),
  designation: z
    .string({ message: "Designation is required" })
    .trim()
    .min(2, "Designation must be at least 2 characters")
    .max(200, "Designation must be at most 200 characters"),
  image: z
    .string({ message: "Image URL is required" })
    .trim()
    .url("Must be a valid URL"),
  quote: z
    .string({ message: "Quote is required" })
    .trim()
    .min(5, "Quote must be at least 5 characters")
    .max(500, "Quote must be at most 500 characters"),
  order: z.coerce.number().int().min(0).optional().default(0),
  isVisible: z.boolean().optional().default(true),
});

export const updateRenownedTeacherSchema = z.object({
  name: z.string().trim().min(2).max(200).optional(),
  designation: z.string().trim().min(2).max(200).optional(),
  image: z.string().trim().url().optional(),
  quote: z.string().trim().min(5).max(500).optional(),
  order: z.coerce.number().int().min(0).optional(),
  isVisible: z.boolean().optional(),
});

export type CreateRenownedTeacherInput = z.infer<typeof createRenownedTeacherSchema>;
export type UpdateRenownedTeacherInput = z.infer<typeof updateRenownedTeacherSchema>;

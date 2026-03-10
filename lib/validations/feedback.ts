import { z } from "zod";
import { FEEDBACK_CATEGORIES, FEEDBACK_STATUSES } from "@/lib/models/Feedback";

const optionalRatingSchema = z.preprocess(
  (value) => (value === null || value === "" ? undefined : value),
  z.coerce
    .number({ error: "Rating must be a number" })
    .int("Rating must be a whole number")
    .min(1, "Rating must be between 1 and 5")
    .max(5, "Rating must be between 1 and 5")
    .optional(),
);

export const createFeedbackSchema = z.object({
  category: z.enum(FEEDBACK_CATEGORIES, {
    error: `Category must be one of: ${FEEDBACK_CATEGORIES.join(", ")}`,
  }),
  subject: z
    .string({ error: "Subject is required" })
    .trim()
    .min(3, "Subject must be at least 3 characters")
    .max(120, "Subject must be at most 120 characters"),
  message: z
    .string({ error: "Message is required" })
    .trim()
    .min(10, "Message must be at least 10 characters")
    .max(2000, "Message must be at most 2000 characters"),
  rating: optionalRatingSchema,
});

export type CreateFeedbackInput = z.infer<typeof createFeedbackSchema>;

export const updateFeedbackSchema = z.object({
  status: z.enum(FEEDBACK_STATUSES, {
    error: `Status must be one of: ${FEEDBACK_STATUSES.join(", ")}`,
  }),
  adminNotes: z
    .string()
    .trim()
    .max(2000, "Admin notes must be at most 2000 characters")
    .optional(),
});

export type UpdateFeedbackInput = z.infer<typeof updateFeedbackSchema>;

export const listFeedbacksSchema = z.object({
  status: z
    .enum([...FEEDBACK_STATUSES, "all"])
    .optional()
    .default("all"),
  category: z
    .enum([...FEEDBACK_CATEGORIES, "all"])
    .optional()
    .default("all"),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export type ListFeedbacksInput = z.infer<typeof listFeedbacksSchema>;

export const feedbackObjectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid feedback ID");

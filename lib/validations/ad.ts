import { z } from "zod";
import {
  AD_STATUSES,
  AD_PLACEMENTS,
  AD_TYPES,
} from "@/lib/models/Ad";

// ─── Admin-facing: create a new ad ──────────────────────────────────────

export const createAdSchema = z
  .object({
    title: z
      .string({ message: "Title is required" })
      .trim()
      .min(2, "Title must be at least 2 characters")
      .max(200, "Title must be at most 200 characters"),

    adType: z.enum(AD_TYPES, {
      message: `Ad type must be one of: ${AD_TYPES.join(", ")}`,
    }),

    placement: z.enum(AD_PLACEMENTS, {
      message: `Placement must be one of: ${AD_PLACEMENTS.join(", ")}`,
    }),

    imageUrl: z
      .string()
      .trim()
      .url("Must be a valid URL")
      .max(2000, "URL must be at most 2000 characters")
      .optional(),

    content: z
      .string()
      .trim()
      .max(5000, "Content must be at most 5000 characters")
      .optional(),

    targetUrl: z
      .string()
      .trim()
      .url("Must be a valid URL")
      .max(2000, "URL must be at most 2000 characters")
      .optional(),

    advertiser: z
      .string({ message: "Advertiser name is required" })
      .trim()
      .min(1, "Advertiser name is required")
      .max(200, "Advertiser name must be at most 200 characters"),

    status: z
      .enum(AD_STATUSES, {
        message: `Status must be one of: ${AD_STATUSES.join(", ")}`,
      })
      .optional()
      .default("inactive"),

    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),

    priority: z.coerce
      .number()
      .int()
      .min(0, "Priority cannot be negative")
      .max(100, "Priority cannot exceed 100")
      .optional()
      .default(0),

    notes: z
      .string()
      .trim()
      .max(2000, "Notes must be at most 2000 characters")
      .optional(),

    createdByAdminId: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return data.endDate > data.startDate;
      }
      return true;
    },
    {
      message: "End date must be after start date",
      path: ["endDate"],
    },
  );

export type CreateAdInput = z.infer<typeof createAdSchema>;

// ─── Admin-facing: update an ad ─────────────────────────────────────────

export const updateAdSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(2, "Title must be at least 2 characters")
      .max(200, "Title must be at most 200 characters")
      .optional(),

    adType: z
      .enum(AD_TYPES, {
        message: `Ad type must be one of: ${AD_TYPES.join(", ")}`,
      })
      .optional(),

    placement: z
      .enum(AD_PLACEMENTS, {
        message: `Placement must be one of: ${AD_PLACEMENTS.join(", ")}`,
      })
      .optional(),

    imageUrl: z
      .string()
      .trim()
      .url("Must be a valid URL")
      .max(2000)
      .optional(),

    content: z.string().trim().max(5000).optional(),

    targetUrl: z
      .string()
      .trim()
      .url("Must be a valid URL")
      .max(2000)
      .optional(),

    advertiser: z.string().trim().min(1).max(200).optional(),

    status: z
      .enum(AD_STATUSES, {
        message: `Status must be one of: ${AD_STATUSES.join(", ")}`,
      })
      .optional(),

    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),

    priority: z.coerce.number().int().min(0).max(100).optional(),

    notes: z.string().trim().max(2000).optional(),

    updatedByAdminId: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return data.endDate > data.startDate;
      }
      return true;
    },
    {
      message: "End date must be after start date",
      path: ["endDate"],
    },
  );

export type UpdateAdInput = z.infer<typeof updateAdSchema>;

// ─── List ads query params ──────────────────────────────────────────────

export const listAdsSchema = z.object({
  status: z
    .enum([...AD_STATUSES, "all"] as const)
    .optional()
    .default("all"),
  placement: z
    .enum([...AD_PLACEMENTS, "all"] as const)
    .optional()
    .default("all"),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(200).optional().default(20),
  search: z
    .string()
    .max(200, "Search term must be at most 200 characters")
    .optional(),
});

export type ListAdsInput = z.infer<typeof listAdsSchema>;

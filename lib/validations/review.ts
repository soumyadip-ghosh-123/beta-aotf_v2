import { z } from "zod";

export const createReviewSchema = z
  .object({
    username: z.string().min(1).max(50),
    rating: z.number().int().min(1).max(5),
    title: z.string().max(120).optional().nullable(),
    message: z.string().min(5).max(2000),
    status: z.enum(["active", "hidden"]).optional(),
  })
  .strict();

export const listReviewsSchema = z
  .object({
    status: z.enum(["active", "hidden"]).optional(),
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  })
  .strict();

export const updateReviewSchema = z
  .object({
    rating: z.number().int().min(1).max(5).optional(),
    title: z.string().max(120).optional().nullable(),
    message: z.string().min(5).max(2000).optional(),
    status: z.enum(["active", "hidden"]).optional(),
  })
  .strict();

export const reviewObjectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/);

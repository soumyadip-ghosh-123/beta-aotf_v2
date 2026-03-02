import { z } from "zod";

export const postIdParamSchema = z.object({
  postId: z
    .string()
    .trim()
    .regex(/^P-\d{8}$/, "Invalid postId format"),
});

export const jobIdParamSchema = z.object({
  jobId: z
    .string()
    .trim()
    .regex(/^J-\d{8}$/, "Invalid jobId format"),
});

export const adIdParamSchema = z.object({
  adId: z
    .string()
    .trim()
    .regex(/^AD-\d{8}$/, "Invalid adId format"),
});

export const deleteApplicationsBodySchema = z
  .object({
    applicationIds: z
      .array(z.string().trim().min(1, "applicationId cannot be empty"))
      .max(500, "Cannot delete more than 500 applications at once")
      .optional(),
  })
  .strict();

export type DeleteApplicationsBodyInput = z.infer<
  typeof deleteApplicationsBodySchema
>;

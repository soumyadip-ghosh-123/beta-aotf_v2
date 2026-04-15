import { z } from "zod";

const timeSchema = z.object({
  hour: z.number().min(0, "Invalid hour").max(23, "Invalid hour"),
  minute: z.number().min(0, "Invalid minute").max(59, "Invalid minute"),
});

export const eventSchema = z
  .object({
    user: z.string().min(1, "User is required"),

    title: z.string().min(1, "Title is required"),

    description: z.string().min(1, "Description is required"),

    startDate: z.date(),
    startTime: timeSchema,

    endDate: z.date(),
    endTime: timeSchema,

    color: z.enum(
      ["blue", "green", "red", "yellow", "purple", "orange", "gray"],
      {
        error: "Color is required", // ✅ Zod v4 way
      }
    ),
  })

  // ✅ Required checks (for undefined cases)
  .refine((data) => data.startDate instanceof Date, {
    message: "Start date is required",
    path: ["startDate"],
  })
  .refine((data) => data.endDate instanceof Date, {
    message: "End date is required",
    path: ["endDate"],
  })
  .refine((data) => !!data.startTime, {
    message: "Start time is required",
    path: ["startTime"],
  })
  .refine((data) => !!data.endTime, {
    message: "End time is required",
    path: ["endTime"],
  })

  // ✅ Date comparison
  .refine(
    (data) => {
      const start = new Date(data.startDate);
      start.setHours(data.startTime.hour, data.startTime.minute, 0, 0);

      const end = new Date(data.endDate);
      end.setHours(data.endTime.hour, data.endTime.minute, 0, 0);

      return start < end;
    },
    {
      message: "End date/time must be after start date/time",
      path: ["endDate"],
    }
  );

export type TEventFormData = z.infer<typeof eventSchema>;
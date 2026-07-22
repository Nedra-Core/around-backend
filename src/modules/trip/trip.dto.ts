import { z } from "zod";

export const createTripSchema = z.object({
    startLocation: z.string("Start location as a string is required").trim().min(3, "Start location must be a string and at least 3 characters long.").max(255, "Start location must be at most 255 characters long."),
    endLocation: z.string("End location as a string is required").trim().min(3, "End location must be a string and at least 3 characters long.").max(255, "End location must be at most 255 characters long."),
    startTime: z.string("Start time as a string is required").trim().min(3, "Start time must be a string and at least 3 characters long.").max(255, "Start time must be at most 255 characters long."),
});

export type CreateTripDto = z.infer<typeof createTripSchema>;

export const updateTripSchema = createTripSchema.partial().strict().refine(data => Object.keys(data).length > 0, {
    message: "Please provide at least one valid field to update (startLocation, endLocation, startTime).",
});

export type UpdateTripDto = z.infer<typeof updateTripSchema>;
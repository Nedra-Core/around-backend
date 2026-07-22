import { z } from "zod";

export const CreateTripSchema = z.object({
    startLocation: z.string("Start location as a string is required").trim().min(3, "Start location must be a string and at least 3 characters long.").max(255, "Start location must be at most 255 characters long."),
    endLocation: z.string("End location as a string is required").trim().min(3, "End location must be a string and at least 3 characters long.").max(255, "End location must be at most 255 characters long."),
    startTime: z.string("Start time as a string is required").trim().min(3, "Start time must be a string and at least 3 characters long.").max(255, "Start time must be at most 255 characters long."),
});

export type CreateTripDto = z.infer<typeof CreateTripSchema>;
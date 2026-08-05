import { z } from "zod";

export const createTripSchema = z.object({
    startLocation: z.string("Start location as a string is required").trim().min(3, "Start location must be a string and at least 3 characters long.").max(255, "Start location must be at most 255 characters long."),
    endLocation: z.string("End location as a string is required").trim().min(3, "End location must be a string and at least 3 characters long.").max(255, "End location must be at most 255 characters long."),
    startTime: z.coerce.date("Start time must be a valid date").refine(date => date > new Date(), "Start time must be a future date and time."),
    availableSeats: z.number("Available seats must be a number").int("Available seats must be an integer").min(1, "Available seats must be at least 1").max(10, "Available seats must be at most 10"),
    price: z.number("Price must be a number").min(0, "Price must be at least 0").max(1000, "Price must be at most 1000"),
});

export type CreateTripDto = z.infer<typeof createTripSchema>;

export const updateTripSchema = createTripSchema.partial().strict().refine(data => Object.keys(data).length > 0, {
    message: "Please provide at least one valid field to update (startLocation, endLocation, startTime).",
});

export type UpdateTripDto = z.infer<typeof updateTripSchema>;
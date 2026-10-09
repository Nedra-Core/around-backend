import { z } from "zod";
import { publicUserResponseSchema } from "../user/user.dto";

export const createTripSchema = z.object({
    startLocation: z.string("Start location as a string is required").trim().min(3, "Start location must be a string and at least 3 characters long.").max(255, "Start location must be at most 255 characters long."),
    endLocation: z.string("End location as a string is required").trim().min(3, "End location must be a string and at least 3 characters long.").max(255, "End location must be at most 255 characters long."),
    startTime: z.coerce.date("Start time must be a valid date").refine(date => date > new Date(), "Start time must be a future date and time."),
    availableSeats: z.number("Available seats must be a number").int("Available seats must be an integer").min(1, "Available seats must be at least 1").max(10, "Available seats must be at most 10"),
    price: z.number("Price must be a number").min(0, "Price must be at least 0").max(1000, "Price must be at most 1000"),
});

export type CreateTripDto = z.infer<typeof createTripSchema>;

export const updateTripSchema = createTripSchema
    .partial()
    .extend({
        availableSeats: z.number("Available seats must be a number").int("Available seats must be an integer").min(0, "Available seats cannot be negative").max(10, "Available seats must be at most 10").optional(),
    })
    .strict()
    .refine(data => Object.keys(data).length > 0, {
        message: "Please provide at least one valid field to update (startLocation, endLocation, startTime).",
    });

export type UpdateTripDto = z.infer<typeof updateTripSchema>;

export const searchTripsSchema = z.object({
    startLocation: z.string().trim().min(1, "Start location must not be empty").max(255, "Start location must be at most 255 characters long.").optional(),
    endLocation: z.string().trim().min(1, "End location must not be empty").max(255, "End location must be at most 255 characters long.").optional(),
    date: z.coerce.date("Date must be a valid date").optional(),
    seats: z.coerce.number("Seats must be a number").int("Seats must be an integer").positive("Seats must be a positive number").max(10, "Seats must be at most 10").optional(),
    page: z.coerce.number("Page must be a number").int("Page must be an integer").positive("Page must be a positive number").default(1),
    limit: z.coerce.number("Limit must be a number").int("Limit must be an integer").positive("Limit must be a positive number").max(100, "Limit must be at most 100").default(20),
});

export type SearchTripsDto = z.infer<typeof searchTripsSchema>;

export const publicTripResponseSchema = z.object({
    id: z.number(),
    startLocation: z.string(),
    endLocation: z.string(),
    startTime: z.date(),
    price: z.coerce.number()
});

export type PublicTripResponseDto = z.infer<typeof publicTripResponseSchema>;

export const tripResponseSchema = publicTripResponseSchema.extend({
    availableSeats: z.number(),
    driver: publicUserResponseSchema,
});

export type TripResponseDto = z.infer<typeof tripResponseSchema>;

export const createTripResponseSchema = tripResponseSchema.omit({
    driver: true,
});

export type CreateTripResponseDto = z.infer<typeof createTripResponseSchema>;

export const searchTripsResponseSchema = z.object({
    items: z.array(tripResponseSchema),
    total: z.number(),
    page: z.number(),
    limit: z.number(),
});

export type SearchTripsResponseDto = z.infer<typeof searchTripsResponseSchema>;
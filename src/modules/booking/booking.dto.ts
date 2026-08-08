import { z } from "zod";
import { BookingStatus } from "./booking.entity";
import { publicUserResponseSchema } from "../user/user.dto";
import { publicTripResponseSchema } from "../trip/trip.dto";

export const createBookingSchema = z.object({
    tripId: z.number('Trip ID is required').int().positive('Trip ID must be a positive number'),
    seats: z.number('Seats are required').int().positive('Seats must be a positive number').max(7, 'Seats cannot exceed 7'),
});

export type CreateBookingDto = z.infer<typeof createBookingSchema>;

export const bookingResponseSchema = z.object({
    id: z.number(),
    passengerId: z.number(),
    tripId: z.number(),
    seats: z.number(),
    status: z.enum(BookingStatus),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export type BookingResponseDto = z.infer<typeof bookingResponseSchema>;

export const updateBookingStatusSchema = z.object({
    status: z.enum(BookingStatus, {
        error: (issue) => issue.input === undefined ? "Status is required" : "Invalid status value",
    }),
});
export type UpdateBookingStatusDto = z.infer<typeof updateBookingStatusSchema>;

export const passengerBookingResponseSchema = z.object({
    id: z.number(),
    seats: z.number(),
    status: z.enum(BookingStatus),
    createdAt: z.date(),
    updatedAt: z.date(),
    trip: publicTripResponseSchema 
});

export type PassengerBookingResponseDto = z.infer<typeof passengerBookingResponseSchema>;

export const driverBookingResponseSchema = z.object({
    id: z.number(),
    seats: z.number(),
    status: z.enum(BookingStatus),
    createdAt: z.date(),
    updatedAt: z.date(),
    passenger: publicUserResponseSchema 
});

export type DriverBookingResponseDto = z.infer<typeof driverBookingResponseSchema>;
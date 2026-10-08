import { Trip } from "./trip.entity";
import { TripResponseDto, tripResponseSchema, createTripResponseSchema, CreateTripResponseDto } from "./trip.dto";

export const mapToTripResponseDto = (trip: Trip): TripResponseDto => {
    return tripResponseSchema.parse(trip);
}

export const mapToCreateTripResponseDto = (trip: Trip): CreateTripResponseDto => {
    return createTripResponseSchema.parse(trip);
}
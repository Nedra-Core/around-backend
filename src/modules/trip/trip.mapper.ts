import { Trip } from "./trip.entity";
import { TripResponseDto, tripResponseSchema } from "./trip.dto";

export const mapToTripResponseDto = (trip: Trip): TripResponseDto => {
    return tripResponseSchema.parse(trip);
}
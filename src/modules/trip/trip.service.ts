import { TripRepository } from './trip.repository';
import { CreateTripDto, SearchTripsDto, TripResponseDto, UpdateTripDto } from './trip.dto';
import { Trip } from './trip.entity';
import { ForbiddenError, NotFoundError } from '../../exceptions/custom.errors';
import { mapToTripResponseDto } from './trip.mapper';

export class TripService {
    constructor(private tripRepository: TripRepository) { }

    async searchTrips(filters: SearchTripsDto): Promise<TripResponseDto[]> {
        const trips = await this.tripRepository.searchTrips(filters);
        return trips.map(mapToTripResponseDto);
    }

    async getDriverTrips(authUserId: number): Promise<TripResponseDto[]> {
        const trips = await this.tripRepository.findTripsByDriver(authUserId);
        return trips.map(mapToTripResponseDto);
    }

    async getTripDetailsById(id: number): Promise<TripResponseDto> {
        const trip = await this.tripRepository.findTripById(id);
        if (!trip) {
            throw new NotFoundError("Trip not found");
        }
        return mapToTripResponseDto(trip);
    }

    async getTripById(id: number): Promise<Trip> {
        const trip = await this.tripRepository.findTripById(id);
        if (!trip) {
            throw new NotFoundError("Trip not found");
        }
        return trip;
    }

    async createTrip(authUserId: number, tripData: CreateTripDto): Promise<Trip> {
        return this.tripRepository.createTrip(authUserId, tripData);
    }

    async updateTrip(authUserId: number, targetTripId: number, updateDto: UpdateTripDto): Promise<void> {
        const trip = await this.tripRepository.findTripById(targetTripId);
        if (!trip) {
            throw new NotFoundError("Trip not found");
        }
        if (authUserId !== trip.driverId) {
            throw new ForbiddenError("Unauthorized to update this trip");
        }

        const isUpdated = await this.tripRepository.updateTrip(targetTripId, updateDto);
        if (!isUpdated) {
            throw new NotFoundError("Failed to update trip");
        }
    }

    async deleteTrip(authUserId: number, targetTripId: number): Promise<void> {
        const trip = await this.tripRepository.findTripById(targetTripId);
        if (!trip) {
            throw new NotFoundError("Trip not found");
        }
        if (authUserId !== trip.driverId) {
            throw new ForbiddenError("Unauthorized to delete this trip");
        }
        const isDeleted = await this.tripRepository.deleteTrip(targetTripId);
        if (!isDeleted) {
            throw new NotFoundError("Failed to delete trip");
        }
    }
}
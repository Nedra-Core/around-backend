import { TripRepository } from './trip.repository';
import { CreateTripDto, UpdateTripDto } from './trip.dto';
import { Trip } from './trip.entity';
import { NotFoundError, UnauthorizedError } from '../../exceptions/custom.errors';

export class TripService {
    constructor(private tripRepository: TripRepository) { }

    async getAllTrips(): Promise<Trip[]> {
        return this.tripRepository.findAllTrips();
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
            throw new UnauthorizedError("Unauthorized to update this trip");
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
            throw new UnauthorizedError("Unauthorized to delete this trip");
        }
        const isDeleted = await this.tripRepository.deleteTrip(targetTripId);
        if (!isDeleted) {
            throw new NotFoundError("Failed to delete trip");
        }
    }
}
import { TripRepository } from './trip.repository';
import { CreateTripDto } from './trip.dto';
import { Trip } from './trip.entity';

export class TripService {
    constructor(private tripRepository: TripRepository) {}

  async createTrip(authUserId: number, tripData: CreateTripDto) : Promise<Trip> {
    return this.tripRepository.createTrip(authUserId, tripData);
  }

    async getAllTrips(): Promise<Trip[]> {
        return this.tripRepository.findAllTrips();
    }
}
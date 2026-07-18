import { tripRepository } from '../../container';
import { Trip } from './trip.entity';

export class TripService {

  async createTrip(trip: any) : Promise<Trip> {
    return tripRepository.createTrip(trip);
  }
}
import { AppDataSource } from "../../config/database";
import { Trip } from "./trip.entity";


export class TripRepository {
    private tripRepository = AppDataSource.getRepository(Trip);

  async createTrip(trip: Trip) : Promise<Trip> {
    return this.tripRepository.save(trip);
  }

}
import { DataSource, Repository } from "typeorm";
import { CreateTripDto } from "./trip.dto";
import { Trip } from "./trip.entity";


export class TripRepository {
    private tripRepository: Repository<Trip>;

    constructor(private dataSource: DataSource) {
        this.tripRepository = this.dataSource.getRepository(Trip);
    }

  async createTrip(authUserId: number, trip: CreateTripDto) : Promise<Trip> {
    const newTrip = this.tripRepository.create({
      ...trip,
        driverId: authUserId,
    });
    return this.tripRepository.save(newTrip);
  }

    async findAllTrips(): Promise<Trip[]> {
        return this.tripRepository.find();
    }

}
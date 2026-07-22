import { DataSource, Repository } from "typeorm";
import { CreateTripDto, UpdateTripDto } from "./trip.dto";
import { Trip } from "./trip.entity";


export class TripRepository {
    private tripRepository: Repository<Trip>;

    constructor(private dataSource: DataSource) {
        this.tripRepository = this.dataSource.getRepository(Trip);
    }
    
    async findAllTrips(): Promise<Trip[]> {
        return this.tripRepository.find( { where: { isDeleted: false } });
    }
    
    async findTripById(id: number): Promise<Trip | null> {
        return this.tripRepository.findOne({ where: { id, isDeleted: false } });
    }
    
      async createTrip(authUserId: number, trip: CreateTripDto) : Promise<Trip> {
        const newTrip = this.tripRepository.create({
          ...trip,
            driverId: authUserId,
        });
        return this.tripRepository.save(newTrip);
      }

    async updateTrip(targetTripId: number, updateDto: UpdateTripDto): Promise<void> {
        await this.tripRepository.update(targetTripId, updateDto);
    }

    async deleteTrip(targetTripId: number): Promise<void> {
        await this.tripRepository.update(targetTripId, { isDeleted: true });
    }

}
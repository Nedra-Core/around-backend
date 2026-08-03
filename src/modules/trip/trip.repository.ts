import { DataSource, Repository } from "typeorm";
import { CreateTripDto, UpdateTripDto } from "./trip.dto";
import { Trip } from "./trip.entity";


export class TripRepository {
    private tripRepository: Repository<Trip>;

    constructor(private dataSource: DataSource) {
        this.tripRepository = this.dataSource.getRepository(Trip);
    }
    
    async findAllTrips(): Promise<Trip[]> {
        return this.tripRepository.find();
    }
    
    async findTripById(id: number): Promise<Trip | null> {
        return this.tripRepository.findOne({ where: { id } });
    }
    
      async createTrip(authUserId: number, trip: CreateTripDto) : Promise<Trip> {
        const newTrip = this.tripRepository.create({
          ...trip,
            driverId: authUserId,
        });
        return this.tripRepository.save(newTrip);
      }

    async updateTrip(targetTripId: number, updateDto: UpdateTripDto): Promise<boolean> {
        const result = await this.tripRepository.update(targetTripId, updateDto);
        return result.affected !== undefined && result.affected > 0;
    }

    async deleteTrip(targetTripId: number): Promise<boolean> {
        const result = await this.tripRepository.softDelete(targetTripId);
        return result.affected !== undefined && result.affected > 0;
    }

}
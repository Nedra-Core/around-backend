import { DataSource, In, Repository } from "typeorm";
import { CreateTripDto, SearchTripsDto, UpdateTripDto } from "./trip.dto";
import { Trip } from "./trip.entity";
import { Booking, BookingStatus } from "../booking/booking.entity";


export class TripRepository {
    private tripRepository: Repository<Trip>;

    constructor(private dataSource: DataSource) {
        this.tripRepository = this.dataSource.getRepository(Trip);
    }

    async searchTrips(filters: SearchTripsDto): Promise<Trip[]> {
        const query = this.tripRepository.createQueryBuilder('trip')
            .where('trip.startTime > :now', { now: new Date() });

        if (filters.startLocation) {
            query.andWhere('trip.startLocation ILIKE :startLocation', { startLocation: `%${filters.startLocation}%` });
        }

        if (filters.endLocation) {
            query.andWhere('trip.endLocation ILIKE :endLocation', { endLocation: `%${filters.endLocation}%` });
        }

        if (filters.date) {
            const startOfDay = new Date(filters.date);
            startOfDay.setUTCHours(0, 0, 0, 0);
            const endOfDay = new Date(startOfDay);
            endOfDay.setUTCDate(endOfDay.getUTCDate() + 1);
            query.andWhere('trip.startTime >= :startOfDay AND trip.startTime < :endOfDay', { startOfDay, endOfDay });
        }

        if (filters.seats) {
            query.andWhere('trip.availableSeats >= :seats', { seats: filters.seats });
        }

        return query.orderBy('trip.startTime', 'ASC').getMany();
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
        return this.dataSource.transaction(async (manager) => {
            const result = await manager.softDelete(Trip, targetTripId);
            if (!result.affected) {
                return false;
            }

            await manager.update(Booking,
                { tripId: targetTripId, status: In([BookingStatus.PENDING, BookingStatus.APPROVED]) },
                { status: BookingStatus.REJECTED }
            );
            return true;
        });
    }

}
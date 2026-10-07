import { And, DataSource, FindOptionsWhere, ILike, In, IsNull, LessThan, MoreThan, MoreThanOrEqual, Repository } from "typeorm";
import { CreateTripDto, SearchTripsDto, UpdateTripDto } from "./trip.dto";
import { Trip } from "./trip.entity";
import { Booking, BookingStatus } from "../booking/booking.entity";


export class TripRepository {
    private tripRepository: Repository<Trip>;

    constructor(private dataSource: DataSource) {
        this.tripRepository = this.dataSource.getRepository(Trip);
    }

    async searchTrips(filters: SearchTripsDto): Promise<Trip[]> {
        const now = new Date();
        const where: FindOptionsWhere<Trip> = {
            deletedAt: IsNull(),
            startTime: MoreThan(now),
        };

        if (filters.startLocation) {
            where.startLocation = ILike(`%${filters.startLocation}%`);
        }

        if (filters.endLocation) {
            where.endLocation = ILike(`%${filters.endLocation}%`);
        }

        if (filters.date) {
            const startOfDay = new Date(filters.date);
            startOfDay.setUTCHours(0, 0, 0, 0);
            const endOfDay = new Date(startOfDay);
            endOfDay.setUTCDate(endOfDay.getUTCDate() + 1);
            where.startTime = And(MoreThan(now), MoreThanOrEqual(startOfDay), LessThan(endOfDay));
        }

        if (filters.seats) {
            where.availableSeats = MoreThanOrEqual(filters.seats);
        }

        return this.tripRepository.find({
            where,
            relations: { driver: true },
            withDeleted: true,
            order: { startTime: 'ASC' },
        });
    }

    async findTripsByDriver(driverId: number): Promise<Trip[]> {
        return this.tripRepository.find({
            where: { driverId, deletedAt: IsNull() },
            relations: { driver: true },
            withDeleted: true,
            order: { startTime: 'DESC' },
        });
    }

    async findTripById(id: number): Promise<Trip | null> {
        return this.tripRepository.findOne({ 
            where: { id, deletedAt: IsNull() },
            relations: { driver: true },
            withDeleted: true,
        });
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
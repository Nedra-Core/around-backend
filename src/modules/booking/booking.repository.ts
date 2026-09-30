import { DataSource, IsNull, MoreThanOrEqual, Repository } from "typeorm";
import { Booking, BookingStatus } from "./booking.entity";
import { Trip } from "../trip/trip.entity";
import { CreateBookingDto } from "./booking.dto";
import { ConflictError } from "../../exceptions/custom.errors";

export class BookingRepository {
    private bookingRepository: Repository<Booking>;

    constructor(private dataSource: DataSource) {
        this.bookingRepository = this.dataSource.getRepository(Booking);
    }

    async createBooking(passengerId: number, createBookingDto: CreateBookingDto): Promise<Booking> {
        const booking = this.bookingRepository.create({
            passengerId,
            tripId: createBookingDto.tripId,
            seats: createBookingDto.seats
        });
        return this.bookingRepository.save(booking);
    }

    async findByPassengerId(passengerId: number): Promise<Booking[]> {
        return this.bookingRepository.find({
            where: { passengerId, deletedAt: IsNull() },
            relations: { trip: true },
            withDeleted: true,
        });
    }

    async findByTripId(tripId: number): Promise<Booking[]> {
        return this.bookingRepository.find({
            where: { tripId, deletedAt: IsNull() },
            relations: { passenger: true },
            withDeleted: true,
        });
    }

    async findById(bookingId: number): Promise<Booking | null> {
        return this.bookingRepository.findOne({
            where: { id: bookingId, deletedAt: IsNull() },
            relations: { trip: true, passenger: true },
            withDeleted: true,
        });
    }

    async updateStatusWithSeats(booking: Booking, newStatus: BookingStatus, seatDifference: number): Promise<void> {
        await this.dataSource.transaction(async (manager) => {
            const statusResult = await manager.update(Booking,
                { id: booking.id, status: booking.status },
                { status: newStatus }
            );
            if (!statusResult.affected) {
                throw new ConflictError("The booking status was changed by another request. Please refresh and try again.");
            }

            if (seatDifference < 0) {
                const seatsResult = await manager.decrement(Trip,
                    { id: booking.tripId, availableSeats: MoreThanOrEqual(-seatDifference) },
                    'availableSeats', -seatDifference
                );
                if (!seatsResult.affected) {
                    throw new ConflictError("Not enough available seats to approve this booking.");
                }
            } else if (seatDifference > 0) {
                await manager.increment(Trip, { id: booking.tripId }, 'availableSeats', seatDifference);
            }
        });
    }

}
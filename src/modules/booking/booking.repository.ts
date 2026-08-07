import { DataSource, Repository } from "typeorm";
import { Booking, BookingStatus } from "./booking.entity";

export class BookingRepository {
    private bookingRepository: Repository<Booking>;

    constructor(private dataSource: DataSource) {
        this.bookingRepository = this.dataSource.getRepository(Booking);
    }

    async createBooking(passengerId: number, tripId: number, seats: number): Promise<Booking> {
        const booking = this.bookingRepository.create({
            passengerId,
            tripId,
            seats
        });
        return this.bookingRepository.save(booking);
    }


    async findByPassengerId(passengerId: number): Promise<Booking[]> {
        return this.bookingRepository.find({
            where: { passengerId },
            relations: { trip: true },
        });
    }

    async findByTripId(tripId: number): Promise<Booking[]> {
        return this.bookingRepository.find({
            where: { tripId },
            relations: { passenger: true },
        });
    }

    async findById(bookingId: number): Promise<Booking | null> {
        return this.bookingRepository.findOne({
            where: { id: bookingId },
            relations: { trip: true, passenger: true },
        });
    }

    async updateStatus(bookingId: number, status: BookingStatus): Promise<boolean> {
        const result = await this.bookingRepository.update(bookingId, { status });
        return (result.affected !== undefined && result.affected > 0);
    }

}
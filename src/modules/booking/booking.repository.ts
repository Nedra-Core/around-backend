import { DataSource, Repository } from "typeorm";
import { Booking } from "./booking.entity";

export class BookingRepository {
    private bookingRepository: Repository<Booking>;

    constructor(private dataSource: DataSource) {
        this.bookingRepository = this.dataSource.getRepository(Booking);
    }

    async createBooking(passengerId: number, tripId: number, seats: number): Promise<Booking> {
        const booking = this.bookingRepository.create({
            passenger: { id: passengerId }, 
            trip: { id: tripId },
            seats: seats,
        });
        return this.bookingRepository.save(booking);
    }


    async findByPassengerId(passengerId: number): Promise<Booking[]> {
        return this.bookingRepository.find({
            where: { passenger: { id: passengerId } },
            relations: { passenger: true},
        });
    }

}
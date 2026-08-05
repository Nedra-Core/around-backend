import { BookingRepository } from './booking.repository';
import { TripService } from '../trip/trip.service';
import { Booking} from './booking.entity';
import { ConflictError } from '../../exceptions/custom.errors';

export class BookingService {
    constructor(
        private bookingRepository: BookingRepository,
        private tripService: TripService
    ) {}

    async createBooking(passengerId: number, tripId: number, seats: number): Promise<Booking> {
        const trip = await this.tripService.getTripById(tripId);

        if (trip.driverId === passengerId) {
            throw new ConflictError("You cannot book your own trip.");
        }

        if (trip.availableSeats < seats) {
            throw new ConflictError(`Not enough seats. Only ${trip.availableSeats} available.`);
        }

        return this.bookingRepository.createBooking(passengerId, tripId, seats);
    }

    async getPassengerBookings(passengerId: number): Promise<Booking[]> {
        return this.bookingRepository.findByPassengerId(passengerId);
    }

}
import { BookingRepository } from './booking.repository';
import { TripService } from '../trip/trip.service';
import { Booking, BookingStatus} from './booking.entity';
import { ConflictError, UnauthorizedError } from '../../exceptions/custom.errors';

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

    async getTripBookings(authUserId: number, tripId: number): Promise<Booking[]> {
        const trip = await this.tripService.getTripById(tripId);
        if (trip.driverId !== authUserId) {
            throw new UnauthorizedError("You are not authorized to view bookings for this trip.");
        }

        return this.bookingRepository.findByTripId(tripId);
    }

    async updateBookingStatus(authUserId: number, bookingId: number, newStatus: BookingStatus): Promise<void> {
    const booking = await this.bookingRepository.findById(bookingId);
    if (!booking) {
        throw new Error("Booking not found"); 
    }

    const isDriver = booking.trip.driverId === authUserId;
    const isPassenger = booking.passenger.id === authUserId;

    if (!isDriver && !isPassenger) {
        throw new UnauthorizedError("You are not authorized to update this booking.");
    }

    if (isPassenger && newStatus !== BookingStatus.CANCELLED) {
        throw new UnauthorizedError("Passengers can only cancel their own bookings.");
    }
    
    if (booking.status === BookingStatus.CANCELLED || booking.status === BookingStatus.REJECTED) {
        throw new ConflictError("Cannot change the status of a booking that is already cancelled or rejected.");
    }

    if (isDriver && newStatus === BookingStatus.CANCELLED) {
        throw new UnauthorizedError("Drivers should use REJECTED to decline a booking, not CANCELLED.");
    }

    if (booking.status === newStatus) {
        return; 
    }

    let seatDifference = 0;

    if (newStatus === BookingStatus.APPROVED && booking.status !== BookingStatus.APPROVED) {
        seatDifference = -booking.seats;
    } 
    else if (booking.status === BookingStatus.APPROVED && 
            (newStatus === BookingStatus.CANCELLED || newStatus === BookingStatus.REJECTED)) {
        seatDifference = booking.seats;
    }

    if (seatDifference !== 0) {
        const newAvailableSeats = booking.trip.availableSeats + seatDifference;
        
        if (newAvailableSeats < 0) {
            throw new ConflictError("Not enough available seats to approve this booking.");
        }

        await this.tripService.updateTrip(booking.trip.driverId, booking.trip.id, {
            availableSeats: newAvailableSeats
        });
    }

    await this.bookingRepository.updateStatus(bookingId, newStatus);
}
}
import { BookingRepository } from './booking.repository';
import { TripService } from '../trip/trip.service';
import { BookingStatus} from './booking.entity';
import { ConflictError, NotFoundError, UnauthorizedError } from '../../exceptions/custom.errors';
import { BookingResponseDto, CreateBookingDto, PassengerBookingResponseDto, DriverBookingResponseDto, UpdateBookingStatusDto } from './booking.dto';
import { mapToBookingResponseDto, mapToPassengerBookingDto, mapToDriverBookingDto} from './booking.mapper';

export class BookingService {
    constructor(
        private bookingRepository: BookingRepository,
        private tripService: TripService
    ) {}

    async createBooking(passengerId: number, createBookingDto: CreateBookingDto): Promise<BookingResponseDto> {
        const trip = await this.tripService.getTripById(createBookingDto.tripId);

        if (trip.driverId === passengerId) {
            throw new ConflictError("You cannot book your own trip.");
        }

        if (trip.availableSeats < createBookingDto.seats) {
            throw new ConflictError(`Not enough seats. Only ${trip.availableSeats} available.`);
        }

        const booking = await this.bookingRepository.createBooking(passengerId, createBookingDto);

        return mapToBookingResponseDto(booking);
    }

    async getPassengerBookings(passengerId: number): Promise<PassengerBookingResponseDto[]> {
        const bookings = await this.bookingRepository.findByPassengerId(passengerId);
        return bookings.map(mapToPassengerBookingDto);
    }

    async getTripBookings(authUserId: number, tripId: number): Promise<DriverBookingResponseDto[]> {
        const trip = await this.tripService.getTripById(tripId);
        if (trip.driverId !== authUserId) {
            throw new UnauthorizedError("You are not authorized to view bookings for this trip.");
        }

        const bookings = await this.bookingRepository.findByTripId(tripId);
        return bookings.map(mapToDriverBookingDto);
    }

    async updateBookingStatus(authUserId: number, bookingId: number, updateDto: UpdateBookingStatusDto): Promise<void> {
        const newStatus = updateDto.status;
    const booking = await this.bookingRepository.findById(bookingId);
    if (!booking) {
        throw new NotFoundError("Booking not found"); 
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
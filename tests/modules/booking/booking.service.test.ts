import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BookingService } from '../../../src/modules/booking/booking.service';
import { BookingRepository } from '../../../src/modules/booking/booking.repository';
import { TripService } from '../../../src/modules/trip/trip.service';
import { Booking, BookingStatus } from '../../../src/modules/booking/booking.entity';
import { Trip } from '../../../src/modules/trip/trip.entity';
import { ConflictError, NotFoundError, UnauthorizedError } from '../../../src/exceptions/custom.errors';

const DRIVER_ID = 1;
const PASSENGER_ID = 2;
const STRANGER_ID = 3;

const makeTrip = (overrides: Partial<Trip> = {}): Trip => ({
    id: 10,
    driverId: DRIVER_ID,
    startLocation: 'Sofia',
    endLocation: 'Plovdiv',
    startTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
    availableSeats: 3,
    price: 15,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    ...overrides,
});

const makeBooking = (overrides: Partial<Booking> = {}): Booking => ({
    id: 100,
    passengerId: PASSENGER_ID,
    passenger: { id: PASSENGER_ID } as Booking['passenger'],
    tripId: 10,
    trip: makeTrip(),
    seats: 2,
    status: BookingStatus.PENDING,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    ...overrides,
});

describe('BookingService', () => {
    let bookingRepository: {
        createBooking: ReturnType<typeof vi.fn>;
        findByTripId: ReturnType<typeof vi.fn>;
        findById: ReturnType<typeof vi.fn>;
        findActiveByPassengerIdAndTripId: ReturnType<typeof vi.fn>;
        updateStatusWithSeats: ReturnType<typeof vi.fn>;
    };
    let tripService: { getTripById: ReturnType<typeof vi.fn> };
    let service: BookingService;

    beforeEach(() => {
        bookingRepository = {
            createBooking: vi.fn(),
            findByTripId: vi.fn(),
            findById: vi.fn(),
            findActiveByPassengerIdAndTripId: vi.fn().mockResolvedValue(null),
            updateStatusWithSeats: vi.fn(),
        };
        tripService = { getTripById: vi.fn() };
        service = new BookingService(
            bookingRepository as unknown as BookingRepository,
            tripService as unknown as TripService
        );
    });

    describe('createBooking', () => {
        it('rejects booking your own trip', async () => {
            tripService.getTripById.mockResolvedValue(makeTrip());

            await expect(service.createBooking(DRIVER_ID, { tripId: 10, seats: 1 }))
                .rejects.toThrow('You cannot book your own trip.');
            expect(bookingRepository.createBooking).not.toHaveBeenCalled();
        });

        it('rejects booking a trip when you already have an active booking', async () => {
            tripService.getTripById.mockResolvedValue(makeTrip());
            bookingRepository.findActiveByPassengerIdAndTripId.mockResolvedValue(makeBooking());

            await expect(service.createBooking(PASSENGER_ID, { tripId: 10, seats: 1 }))
                .rejects.toThrow('You already have an active booking for this trip.');
            expect(bookingRepository.createBooking).not.toHaveBeenCalled();
        });

        it('rejects booking a trip that has already started', async () => {
            tripService.getTripById.mockResolvedValue(makeTrip({ startTime: new Date(Date.now() - 1000) }));

            await expect(service.createBooking(PASSENGER_ID, { tripId: 10, seats: 1 }))
                .rejects.toThrow('Cannot book a trip that has already started.');
            expect(bookingRepository.createBooking).not.toHaveBeenCalled();
        });

        it('rejects booking more seats than available', async () => {
            tripService.getTripById.mockResolvedValue(makeTrip({ availableSeats: 1 }));

            await expect(service.createBooking(PASSENGER_ID, { tripId: 10, seats: 2 }))
                .rejects.toThrow('Not enough seats. Only 1 available.');
            expect(bookingRepository.createBooking).not.toHaveBeenCalled();
        });

        it('creates the booking and returns the response dto', async () => {
            tripService.getTripById.mockResolvedValue(makeTrip());
            bookingRepository.createBooking.mockResolvedValue(makeBooking());

            const result = await service.createBooking(PASSENGER_ID, { tripId: 10, seats: 2 });

            expect(bookingRepository.createBooking).toHaveBeenCalledWith(PASSENGER_ID, { tripId: 10, seats: 2 });
            expect(result).toMatchObject({ id: 100, passengerId: PASSENGER_ID, tripId: 10, seats: 2, status: BookingStatus.PENDING });
            expect(result).not.toHaveProperty('trip');
        });
    });

    describe('getTripBookings', () => {
        it('rejects a user who is not the driver', async () => {
            tripService.getTripById.mockResolvedValue(makeTrip());

            await expect(service.getTripBookings(STRANGER_ID, 10)).rejects.toThrow(UnauthorizedError);
            expect(bookingRepository.findByTripId).not.toHaveBeenCalled();
        });
    });

    describe('updateBookingStatus', () => {
        it('throws NotFoundError when the booking does not exist', async () => {
            bookingRepository.findById.mockResolvedValue(null);

            await expect(service.updateBookingStatus(DRIVER_ID, 100, { status: BookingStatus.APPROVED }))
                .rejects.toThrow(NotFoundError);
        });

        it('rejects a user who is neither the driver nor the passenger', async () => {
            bookingRepository.findById.mockResolvedValue(makeBooking());

            await expect(service.updateBookingStatus(STRANGER_ID, 100, { status: BookingStatus.APPROVED }))
                .rejects.toThrow(UnauthorizedError);
        });

        it.each([BookingStatus.APPROVED, BookingStatus.REJECTED])(
            'does not let the passenger set status %s',
            async (status) => {
                bookingRepository.findById.mockResolvedValue(makeBooking());

                await expect(service.updateBookingStatus(PASSENGER_ID, 100, { status }))
                    .rejects.toThrow(UnauthorizedError);
            }
        );

        it('does not let the driver use CANCELLED', async () => {
            bookingRepository.findById.mockResolvedValue(makeBooking());

            await expect(service.updateBookingStatus(DRIVER_ID, 100, { status: BookingStatus.CANCELLED }))
                .rejects.toThrow(UnauthorizedError);
        });

        it.each([BookingStatus.CANCELLED, BookingStatus.REJECTED])(
            'does not change a booking that is already %s',
            async (status) => {
                bookingRepository.findById.mockResolvedValue(makeBooking({ status }));

                await expect(service.updateBookingStatus(DRIVER_ID, 100, { status: BookingStatus.APPROVED }))
                    .rejects.toThrow(ConflictError);
                expect(bookingRepository.updateStatusWithSeats).not.toHaveBeenCalled();
            }
        );

        it('does nothing when the status is unchanged', async () => {
            bookingRepository.findById.mockResolvedValue(makeBooking({ status: BookingStatus.APPROVED }));

            await service.updateBookingStatus(DRIVER_ID, 100, { status: BookingStatus.APPROVED });

            expect(bookingRepository.updateStatusWithSeats).not.toHaveBeenCalled();
        });

        it('takes seats when the driver approves a pending booking', async () => {
            const booking = makeBooking({ seats: 2 });
            bookingRepository.findById.mockResolvedValue(booking);

            await service.updateBookingStatus(DRIVER_ID, 100, { status: BookingStatus.APPROVED });

            expect(bookingRepository.updateStatusWithSeats).toHaveBeenCalledWith(booking, BookingStatus.APPROVED, -2);
        });

        it('returns seats when the driver rejects an approved booking', async () => {
            const booking = makeBooking({ seats: 2, status: BookingStatus.APPROVED });
            bookingRepository.findById.mockResolvedValue(booking);

            await service.updateBookingStatus(DRIVER_ID, 100, { status: BookingStatus.REJECTED });

            expect(bookingRepository.updateStatusWithSeats).toHaveBeenCalledWith(booking, BookingStatus.REJECTED, 2);
        });

        it('returns seats when the passenger cancels an approved booking', async () => {
            const booking = makeBooking({ seats: 2, status: BookingStatus.APPROVED });
            bookingRepository.findById.mockResolvedValue(booking);

            await service.updateBookingStatus(PASSENGER_ID, 100, { status: BookingStatus.CANCELLED });

            expect(bookingRepository.updateStatusWithSeats).toHaveBeenCalledWith(booking, BookingStatus.CANCELLED, 2);
        });

        it('does not touch seats when a pending booking is rejected', async () => {
            const booking = makeBooking({ status: BookingStatus.PENDING });
            bookingRepository.findById.mockResolvedValue(booking);

            await service.updateBookingStatus(DRIVER_ID, 100, { status: BookingStatus.REJECTED });

            expect(bookingRepository.updateStatusWithSeats).toHaveBeenCalledWith(booking, BookingStatus.REJECTED, 0);
        });

        it('passes on the conflict when the repository runs out of seats', async () => {
            bookingRepository.findById.mockResolvedValue(makeBooking());
            bookingRepository.updateStatusWithSeats.mockRejectedValue(new ConflictError('Not enough available seats to approve this booking.'));

            await expect(service.updateBookingStatus(DRIVER_ID, 100, { status: BookingStatus.APPROVED }))
                .rejects.toThrow(ConflictError);
        });
    });
});

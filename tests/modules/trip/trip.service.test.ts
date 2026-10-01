import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TripService } from '../../../src/modules/trip/trip.service';
import { TripRepository } from '../../../src/modules/trip/trip.repository';
import { Trip } from '../../../src/modules/trip/trip.entity';
import { NotFoundError, ForbiddenError } from '../../../src/exceptions/custom.errors';

const DRIVER_ID = 1;
const OTHER_USER_ID = 2;

const makeTrip = (overrides: Partial<Trip> = {}): Trip => ({
    id: 10,
    driverId: DRIVER_ID,
    startLocation: 'Sofia',
    endLocation: 'Plovdiv',
    startTime: new Date('2026-10-20T10:00:00Z'),
    availableSeats: 3,
    price: 15,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    ...overrides,
});

describe('TripService', () => {
    let tripRepository: {
        searchTrips: ReturnType<typeof vi.fn>;
        findTripById: ReturnType<typeof vi.fn>;
        createTrip: ReturnType<typeof vi.fn>;
        updateTrip: ReturnType<typeof vi.fn>;
        deleteTrip: ReturnType<typeof vi.fn>;
    };
    let service: TripService;

    beforeEach(() => {
        tripRepository = {
            searchTrips: vi.fn(),
            findTripById: vi.fn(),
            createTrip: vi.fn(),
            updateTrip: vi.fn(),
            deleteTrip: vi.fn(),
        };
        service = new TripService(tripRepository as unknown as TripRepository);
    });

    describe('searchTrips', () => {
        it('passes the filters to the repository and returns its result', async () => {
            const trips = [makeTrip()];
            tripRepository.searchTrips.mockResolvedValue(trips);
            const filters = { startLocation: 'Sofia', seats: 2 };

            const result = await service.searchTrips(filters);

            expect(tripRepository.searchTrips).toHaveBeenCalledWith(filters);
            expect(result).toBe(trips);
        });
    });

    describe('getTripById', () => {
        it('returns the trip', async () => {
            const trip = makeTrip();
            tripRepository.findTripById.mockResolvedValue(trip);

            expect(await service.getTripById(10)).toBe(trip);
        });

        it('throws NotFoundError when the trip does not exist', async () => {
            tripRepository.findTripById.mockResolvedValue(null);

            await expect(service.getTripById(10)).rejects.toThrow(NotFoundError);
        });
    });

    describe('createTrip', () => {
        it('creates the trip for the authenticated driver', async () => {
            const tripData = {
                startLocation: 'Sofia',
                endLocation: 'Plovdiv',
                startTime: new Date('2026-10-20T10:00:00Z'),
                availableSeats: 3,
                price: 15,
            };
            const trip = makeTrip();
            tripRepository.createTrip.mockResolvedValue(trip);

            const result = await service.createTrip(DRIVER_ID, tripData);

            expect(tripRepository.createTrip).toHaveBeenCalledWith(DRIVER_ID, tripData);
            expect(result).toBe(trip);
        });
    });

    describe('updateTrip', () => {
        it('throws NotFoundError when the trip does not exist', async () => {
            tripRepository.findTripById.mockResolvedValue(null);

            await expect(service.updateTrip(DRIVER_ID, 10, { price: 20 })).rejects.toThrow(NotFoundError);
            expect(tripRepository.updateTrip).not.toHaveBeenCalled();
        });

        it('does not let another user update the trip', async () => {
            tripRepository.findTripById.mockResolvedValue(makeTrip());

            await expect(service.updateTrip(OTHER_USER_ID, 10, { price: 20 })).rejects.toThrow(ForbiddenError);
            expect(tripRepository.updateTrip).not.toHaveBeenCalled();
        });

        it('updates the trip when the driver asks', async () => {
            tripRepository.findTripById.mockResolvedValue(makeTrip());
            tripRepository.updateTrip.mockResolvedValue(true);

            await service.updateTrip(DRIVER_ID, 10, { price: 20 });

            expect(tripRepository.updateTrip).toHaveBeenCalledWith(10, { price: 20 });
        });

        it('throws NotFoundError when the repository updates nothing', async () => {
            tripRepository.findTripById.mockResolvedValue(makeTrip());
            tripRepository.updateTrip.mockResolvedValue(false);

            await expect(service.updateTrip(DRIVER_ID, 10, { price: 20 })).rejects.toThrow(NotFoundError);
        });
    });

    describe('deleteTrip', () => {
        it('throws NotFoundError when the trip does not exist', async () => {
            tripRepository.findTripById.mockResolvedValue(null);

            await expect(service.deleteTrip(DRIVER_ID, 10)).rejects.toThrow(NotFoundError);
            expect(tripRepository.deleteTrip).not.toHaveBeenCalled();
        });

        it('does not let another user delete the trip', async () => {
            tripRepository.findTripById.mockResolvedValue(makeTrip());

            await expect(service.deleteTrip(OTHER_USER_ID, 10)).rejects.toThrow(ForbiddenError);
            expect(tripRepository.deleteTrip).not.toHaveBeenCalled();
        });

        it('deletes the trip when the driver asks', async () => {
            tripRepository.findTripById.mockResolvedValue(makeTrip());
            tripRepository.deleteTrip.mockResolvedValue(true);

            await service.deleteTrip(DRIVER_ID, 10);

            expect(tripRepository.deleteTrip).toHaveBeenCalledWith(10);
        });

        it('throws NotFoundError when the repository deletes nothing', async () => {
            tripRepository.findTripById.mockResolvedValue(makeTrip());
            tripRepository.deleteTrip.mockResolvedValue(false);

            await expect(service.deleteTrip(DRIVER_ID, 10)).rejects.toThrow(NotFoundError);
        });
    });
});

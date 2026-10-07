import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TripService } from '../../../src/modules/trip/trip.service';
import { TripRepository } from '../../../src/modules/trip/trip.repository';
import { Trip } from '../../../src/modules/trip/trip.entity';
import { User } from '../../../src/modules/user/user.entity';
import { NotFoundError, ForbiddenError } from '../../../src/exceptions/custom.errors';

const DRIVER_ID = 1;
const OTHER_USER_ID = 2;
const START_TIME = new Date(Date.now() + 24 * 60 * 60 * 1000);

const makeDriver = (): User => ({
    id: DRIVER_ID,
    username: 'ivan',
    email: 'ivan@example.com',
    password: 'hashed-password',
    firstName: 'Ivan',
    lastName: 'Petrov',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
});

const makeTrip = (overrides: Partial<Trip> = {}): Trip => ({
    id: 10,
    driverId: DRIVER_ID,
    driver: makeDriver(),
    startLocation: 'Sofia',
    endLocation: 'Plovdiv',
    startTime: START_TIME,
    availableSeats: 3,
    price: 15,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    ...overrides,
});

const expectedTripResponse = {
    id: 10,
    startLocation: 'Sofia',
    endLocation: 'Plovdiv',
    startTime: START_TIME,
    price: 15,
    availableSeats: 3,
    driver: { id: DRIVER_ID, username: 'ivan', firstName: 'Ivan', lastName: 'Petrov' },
};

describe('TripService', () => {
    let tripRepository: {
        searchTrips: ReturnType<typeof vi.fn>;
        findTripsByDriver: ReturnType<typeof vi.fn>;
        findTripById: ReturnType<typeof vi.fn>;
        createTrip: ReturnType<typeof vi.fn>;
        updateTrip: ReturnType<typeof vi.fn>;
        deleteTrip: ReturnType<typeof vi.fn>;
    };
    let service: TripService;

    beforeEach(() => {
        tripRepository = {
            searchTrips: vi.fn(),
            findTripsByDriver: vi.fn(),
            findTripById: vi.fn(),
            createTrip: vi.fn(),
            updateTrip: vi.fn(),
            deleteTrip: vi.fn(),
        };
        service = new TripService(tripRepository as unknown as TripRepository);
    });

    describe('searchTrips', () => {
        it('passes the filters to the repository and returns the trips as response dtos', async () => {
            tripRepository.searchTrips.mockResolvedValue([makeTrip()]);
            const filters = { startLocation: 'Sofia', seats: 2 };

            const result = await service.searchTrips(filters);

            expect(tripRepository.searchTrips).toHaveBeenCalledWith(filters);
            expect(result).toEqual([expectedTripResponse]);
        });
    });

    describe('getDriverTrips', () => {
        it("returns the driver's trips as response dtos", async () => {
            tripRepository.findTripsByDriver.mockResolvedValue([makeTrip(), makeTrip({ id: 11 })]);

            const result = await service.getDriverTrips(DRIVER_ID);

            expect(tripRepository.findTripsByDriver).toHaveBeenCalledWith(DRIVER_ID);
            expect(result).toEqual([expectedTripResponse, { ...expectedTripResponse, id: 11 }]);
        });
    });

    describe('getTripDetailsById', () => {
        it('returns the trip with the driver, without their email or password', async () => {
            tripRepository.findTripById.mockResolvedValue(makeTrip());

            const result = await service.getTripDetailsById(10);

            expect(result).toEqual(expectedTripResponse);
            expect(result.driver).not.toHaveProperty('email');
            expect(result.driver).not.toHaveProperty('password');
        });

        it('throws NotFoundError when the trip does not exist', async () => {
            tripRepository.findTripById.mockResolvedValue(null);

            await expect(service.getTripDetailsById(10)).rejects.toThrow(NotFoundError);
        });
    });

    describe('getTripById', () => {
        it('returns the trip entity for internal use', async () => {
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
                startTime: START_TIME,
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

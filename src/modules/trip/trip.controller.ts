import { TripService } from './trip.service';
import { Request, Response } from 'express';
import { Router } from 'express';
import { authGuard, AuthRequest } from '../../middlewares/auth';
import { asyncHandler } from '../../middlewares/async.handler';
import { createTripSchema, SearchTripsDto, searchTripsSchema, updateTripSchema } from './trip.dto';
import { idParamSchema, validate } from '../../middlewares/resource.validator';

export class TripController {

    public router: Router;

    constructor(private tripService: TripService) {
        this.router = Router();
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get('/', authGuard, validate(searchTripsSchema, 'query'), this.getTrips);
        this.router.post('/', authGuard, validate(createTripSchema), this.createTrip);
        this.router.put('/:id', authGuard, validate(idParamSchema(), 'params'), validate(updateTripSchema), this.updateTrip);
        this.router.delete('/:id', authGuard, validate(idParamSchema(), 'params'), this.deleteTrip);
    }

    getTrips = asyncHandler(async (req: Request, res: Response) => {
        const filters = req.query as unknown as SearchTripsDto;
        const trips = await this.tripService.searchTrips(filters);
        res.status(200).json(trips);
    })

    createTrip = asyncHandler(async (req: AuthRequest, res: Response) => {
        const tripData = req.body;
        const authUserId = req.auth!.id;
        const newTrip = await this.tripService.createTrip(authUserId, tripData);
        res.status(201).json(newTrip);
    })


    updateTrip = asyncHandler(async (req: AuthRequest, res: Response) => {
        const { id: targetTripId } = req.params as unknown as { id: number };
        const authUserId = req.auth!.id;
        const updateDto = req.body;
        await this.tripService.updateTrip(authUserId, targetTripId, updateDto);
        res.status(200).json({ message: "Trip updated successfully" });
    })

    deleteTrip = asyncHandler(async (req: AuthRequest, res: Response) => {
        const { id: targetTripId } = req.params as unknown as { id: number };
        const authUserId = req.auth!.id;
        await this.tripService.deleteTrip(authUserId, targetTripId);
        res.status(200).json({ message: "Trip deleted successfully" });
    })
}
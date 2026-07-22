import { TripService } from './trip.service';
import { Request, Response } from 'express';
import { Router } from 'express';
import { authGuard, AuthRequest } from '../../middlewares/auth';
import { asyncHandler } from '../../middlewares/async.handler';
import { CreateTripSchema } from './trip.dto';
import { validate } from '../../middlewares/resource.validator';

export class TripController {

    public router: Router;

    constructor( private tripService: TripService) {
        this.router = Router();
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.post('/', authGuard, validate(CreateTripSchema), this.createTrip);
        this.router.get('/', authGuard, this.getTrips);
    }

  createTrip = asyncHandler(async (req: AuthRequest, res: Response) => {
    const tripData = req.body;
    const authUserId = req.auth!.id;
    const newTrip = await this.tripService.createTrip(authUserId, tripData);
    res.status(201).json(newTrip);
  })

  getTrips = asyncHandler(async (req: Request, res: Response) => {
    const trips = await this.tripService.getAllTrips();
    res.status(200).json(trips);
  })
}
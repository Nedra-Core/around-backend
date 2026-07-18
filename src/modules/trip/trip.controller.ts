import { tripService } from '../../container';
import { Request, Response } from 'express';
import { Router } from 'express';
import { authGuard } from '../../middlewares/auth';
import { asyncHandler } from '../../middlewares/async.handler';

export class TripController {

    public router: Router;

    constructor() {
        this.router = Router();
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.post('/', authGuard, this.createTrip);
    }

  createTrip = asyncHandler(async (req: Request, res: Response) => {
    const tripData = req.body;
    const newTrip = await tripService.createTrip(tripData);
    res.status(201).json(newTrip);
  })
}
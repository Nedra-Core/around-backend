import { Router, Request, Response } from 'express';
import { BookingService } from './booking.service';
import { authGuard, AuthRequest } from '../../middlewares/auth';
import { asyncHandler } from '../../middlewares/async.handler';

export class BookingController {
    public router: Router;

    constructor(private bookingService: BookingService) {
        this.router = Router();
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.post('/', authGuard, this.createBooking);
        this.router.get('/me', authGuard, this.getMyBookings);
        this.router.get('/trip/:tripId', authGuard, this.getTripBookings);
        this.router.patch('/:id/status', authGuard, this.updateStatus);

    }

    createBooking = asyncHandler(async (req: AuthRequest, res: Response) => {
        const passengerId = req.auth!.id;
        const { tripId, seats } = req.body; 
        
        const booking = await this.bookingService.createBooking(passengerId, tripId, seats);
        res.status(201).json(booking);
    });

    getMyBookings = asyncHandler(async (req: AuthRequest, res: Response) => {
        const passengerId = req.auth!.id;
        const bookings = await this.bookingService.getPassengerBookings(passengerId);
        res.status(200).json(bookings);
    });

    getTripBookings = asyncHandler(async (req: AuthRequest, res: Response) => {
        const authUserId = req.auth!.id;
        const tripId = Number(req.params.tripId);
        
        const bookings = await this.bookingService.getTripBookings(authUserId, tripId);
        res.status(200).json(bookings);
    });

    updateStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
        const authUserId = req.auth!.id;
        const bookingId = Number(req.params.id);
        const { status } = req.body;

        await this.bookingService.updateBookingStatus(authUserId, bookingId, status);
        res.status(200).json({ message: `Booking successfully marked as ${status}` });
    });

}
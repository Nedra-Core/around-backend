import { UserRepository } from './modules/user/user.repository';
import { UserService } from './modules/user/user.service';
import { UserController } from './modules/user/user.controller';

import { TripRepository } from './modules/trip/trip.repository';
import { TripService } from './modules/trip/trip.service';

export const userRepository = new UserRepository();
export const userService = new UserService();
export const userController = new UserController();

export const tripRepository = new TripRepository();
export const tripService = new TripService();

import { AppDataSource } from "./config/database";
import { UserRepository } from './modules/user/user.repository';
import { UserService } from './modules/user/user.service';
import { UserController } from './modules/user/user.controller';

import { TripRepository } from './modules/trip/trip.repository';
import { TripService } from './modules/trip/trip.service';
import { TripController } from "./modules/trip/trip.controller";

export const userRepository = new UserRepository(AppDataSource);
export const userService = new UserService(userRepository);
export const userController = new UserController(userService);

export const tripRepository = new TripRepository(AppDataSource);
export const tripService = new TripService(tripRepository);
export const tripController = new TripController(tripService);

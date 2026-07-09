import { UserRepository } from './modules/user/user.repository';
import { UserService } from './modules/user/user.service';
import { UserController } from './modules/user/user.controller';

export const userRepository = new UserRepository();
export const userService = new UserService();
export const userController = new UserController();

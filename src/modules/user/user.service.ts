import {userRepository} from "../../container";
import {User} from "./user.entity";

export class UserService{

    async getAllUsers() : Promise<User[]> {
        return await userRepository.findAll();
    }

    async registerUser(userData: User) : Promise<User> {
        return await userRepository.createUser(userData);
    }

}
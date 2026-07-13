import {userRepository} from "../../container";
import {User} from "./user.entity";

export class UserService{

    async getAllUsers() : Promise<User[]> {
        return await userRepository.findAll();
    }

    async registerUser(userData: User) : Promise<User> {
        return await userRepository.createUser(userData);
    }

    async updateUser(userId: number, userData: Partial<User>) : Promise<void> {
        await userRepository.updateUser(userId, userData);
    }

    async deleteUser(userId: number) : Promise<void> {
        await userRepository.deleteUser(userId);
    }

}
import {userRepository} from "../../container";
import { RegisterDto, UpdateDto } from "./user.dto";
import {User} from "./user.entity";

export class UserService{

    async getAllUsers() : Promise<User[]> {
        return await userRepository.findAll();
    }

    async registerUser(registerDto: RegisterDto) : Promise<User> {
        return await userRepository.createUser(registerDto);
    }

    async updateUser(userId: number, updateDto: UpdateDto) : Promise<void> {
        await userRepository.updateUser(userId, updateDto);
    }

    async deleteUser(userId: number) : Promise<void> {
        await userRepository.deleteUser(userId);
    }

}
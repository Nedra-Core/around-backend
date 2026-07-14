import {userRepository} from "../../container";
import { RegisterDto, UpdateDto, ResponseDto } from "./user.dto";
import { mapToResponseDto } from "./user.mapper";
import {User} from "./user.entity";

export class UserService{

    async getAllUsers() : Promise<ResponseDto[]> {
        const users = await userRepository.findAll();
        const responseDtos: ResponseDto[] = users.map(user => mapToResponseDto(user));
        return responseDtos;
    }

    async registerUser(registerDto: RegisterDto) : Promise<ResponseDto> {
        const user = await userRepository.createUser(registerDto);
        return mapToResponseDto(user);
    }

    async updateUser(userId: number, updateDto: UpdateDto) : Promise<void> {
        await userRepository.updateUser(userId, updateDto);
    }

    async deleteUser(userId: number) : Promise<void> {
        await userRepository.deleteUser(userId);
    }

}
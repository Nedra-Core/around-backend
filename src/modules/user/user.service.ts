import {userRepository} from "../../container";
import { RegisterDto, UpdateDto, ResponseDto } from "./user.dto";
import { mapToResponseDto } from "./user.mapper";

export class UserService{

    async getAllUsers() : Promise<ResponseDto[]> {
        const users = await userRepository.findAll();
        const responseDtos: ResponseDto[] = users.map(user => mapToResponseDto(user));
        return responseDtos;
    }

    async registerUser(registerDto: RegisterDto) : Promise<ResponseDto> {

        if(!registerDto.username) {
            throw new Error("Validation failed: Please provide username.");
        }
        if(!registerDto.email) {
            throw new Error("Validation failed: Please provide email.");
        }
        if(!registerDto.password) {
            throw new Error("Validation failed: Please provide password."); 
        }
        if(!registerDto.firstName) {
            throw new Error("Validation failed: Please provide firstName.");
        }
        if(!registerDto.lastName) {
            throw new Error("Validation failed: Please provide lastName.");
        }

        const user = await userRepository.createUser(registerDto);
        return mapToResponseDto(user);
    }

    async updateUser(userId: number, updateDto: UpdateDto) : Promise<void> {

        if(!updateDto.username && !updateDto.password && !updateDto.firstName && !updateDto.lastName) {
            throw new Error("Validation failed: Please provide at least one valid field to update (username, password, firstName, lastName).");
        }

        await userRepository.updateUser(userId, updateDto);
    }

    async deleteUser(userId: number) : Promise<void> {
        await userRepository.deleteUser(userId);
    }

}
import {userRepository} from "../../container";
import { RegisterDto, UpdateDto, ResponseDto, LoginDto } from "./user.dto";
import { mapToResponseDto } from "./user.mapper";
import bcrypt from "bcrypt";

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

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(registerDto.password, saltRounds);

        const user = await userRepository.createUser({ ...registerDto, password: hashedPassword });
        return mapToResponseDto(user);
    }

    async loginUser(loginDto: LoginDto): Promise<ResponseDto> {
        if(!loginDto.email) {
            throw new Error("Validation failed: Please provide email.");
        }
        if(!loginDto.password) {
            throw new Error("Validation failed: Please provide password.");
        }

        const user = await userRepository.findByEmail(loginDto.email);
        if (!user) {
            throw new Error("Authentication failed: User not found.");
        }

        const isMatch = await bcrypt.compare(loginDto.password, user.password);
        if (!isMatch) {
            throw new Error("Authentication failed: Invalid email or password.");
        }

        return mapToResponseDto(user);
    }

    async updateUser(userId: number, updateDto: UpdateDto) : Promise<void> {

        if(!updateDto.username && !updateDto.password && !updateDto.firstName && !updateDto.lastName) {
            throw new Error("Validation failed: Please provide at least one valid field to update (username, password, firstName, lastName).");
        }

        if(updateDto.password) {
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(updateDto.password, saltRounds);
            updateDto.password = hashedPassword;
        }

        await userRepository.updateUser(userId, updateDto);
    }

    async deleteUser(userId: number) : Promise<void> {
        await userRepository.deleteUser(userId);
    }

}
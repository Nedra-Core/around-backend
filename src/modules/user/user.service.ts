import {userRepository} from "../../container";
import { RegisterDto, UpdateDto, ResponseDto, LoginDto, AuthResponseDto } from "./user.dto";
import { mapToResponseDto } from "./user.mapper";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export class UserService{

    async getAllUsers() : Promise<ResponseDto[]> {
        const users = await userRepository.findAll();
        const responseDtos: ResponseDto[] = users.map(user => mapToResponseDto(user));
        return responseDtos;
    }

    async registerUser(registerDto: RegisterDto) : Promise<ResponseDto> {

        const existingUser = await userRepository.findByEmail(registerDto.email);
        if (existingUser) {
            throw new Error("Conflict error: Email already exists.");
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(registerDto.password, saltRounds);

        const user = await userRepository.createUser({ ...registerDto, password: hashedPassword });
        return mapToResponseDto(user);
    }

    async loginUser(loginDto: LoginDto): Promise<AuthResponseDto> {
       
        const user = await userRepository.findByEmail(loginDto.email);
        if (!user) {
            throw new Error("Authentication failed: User not found.");
        }

        const isMatch = await bcrypt.compare(loginDto.password, user.password);
        if (!isMatch) {
            throw new Error("Authentication failed: Invalid email or password.");
        }

        const secretKey = process.env.JWT_SECRET;
        if (!secretKey) {
            throw new Error("FATAL ERROR: JWT_SECRET is not defined in environment variables.");
        }
        const token = jwt.sign({ id: user.id, email: user.email }, secretKey, { expiresIn: '1h' });

        return { token, user: mapToResponseDto(user) };
    }

    async updateUser(userId: number, updateDto: UpdateDto) : Promise<void> {

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
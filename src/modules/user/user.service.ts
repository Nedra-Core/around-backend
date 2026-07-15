import {userRepository} from "../../container";
import { ConflictError, UnauthorizedError } from "../../exceptions/custom.errors";
import { AuthJwtPayload } from "../../middlewares/auth";
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

    async registerUser(registerDto: RegisterDto) : Promise<AuthResponseDto> {

        const existingUserByEmail = await userRepository.findByEmail(registerDto.email);
        if (existingUserByEmail) {
            throw new ConflictError("Email already exists.");
        }

        const existingUserByUsername = await userRepository.findByUsername(registerDto.username);
        if (existingUserByUsername) {
            throw new ConflictError("Username already exists.");
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(registerDto.password, saltRounds);

        const user = await userRepository.createUser({ ...registerDto, password: hashedPassword });
        const responseDto = mapToResponseDto(user);

        const token = this.generateToken(user.id, user.email);

        return { token, user: responseDto };

    }

    async loginUser(loginDto: LoginDto): Promise<AuthResponseDto> {
       
        const user = await userRepository.findByEmail(loginDto.email);
        if (!user) {
            throw new UnauthorizedError("Invalid email or password.");
        }

        const isMatch = await bcrypt.compare(loginDto.password, user.password);
        if (!isMatch) {
            throw new UnauthorizedError("Invalid email or password.");
        }

        const token = this.generateToken(user.id, user.email);

        return { token, user: mapToResponseDto(user) };
    }

    async updateUser(authUserId: number | undefined, targetUserId: number, updateDto: UpdateDto) : Promise<void> {

        if (authUserId !== targetUserId) {
            throw new UnauthorizedError("You are not authorized to update this user.");
        }

        if(updateDto.password) {
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(updateDto.password, saltRounds);
            updateDto.password = hashedPassword;
        }

        await userRepository.updateUser(targetUserId, updateDto);
    }

    async deleteUser(authUserId: number | undefined, targetUserId: number) : Promise<void> {
        if (authUserId !== targetUserId) {
            throw new UnauthorizedError("You are not authorized to delete this user.");
        }
        await userRepository.deleteUser(targetUserId);
    }

    private generateToken(id: number, email: string): string {

        const secretKey = process.env.JWT_SECRET;
        if (!secretKey) {
            throw new Error("FATAL ERROR: JWT_SECRET is not defined in environment variables.");
        }
        const payload: AuthJwtPayload = { id, email };
        
        return jwt.sign(payload, secretKey, { expiresIn: '1h' });
    }

}
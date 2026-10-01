import {UserRepository} from "./user.repository";
import { ConflictError, ForbiddenError, NotFoundError, UnauthorizedError } from "../../exceptions/custom.errors";
import { AuthJwtPayload } from "../../middlewares/auth";
import { RegisterDto, UpdateDto, ResponseDto, LoginDto, AuthResponseDto, PublicUserResponseDto } from "./user.dto";
import { mapToResponseDto, mapToPublicUserResponseDto } from "./user.mapper";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export class UserService{

    constructor(private userRepository: UserRepository) {}

    async getMyProfile(id: number) : Promise<ResponseDto> {
        const user = await this.userRepository.findById(id);
        if (!user) {
            throw new NotFoundError("User not found.");
        }
        return mapToResponseDto(user);
    }

    async getPublicProfile(id: number) : Promise<PublicUserResponseDto> {
        const user = await this.userRepository.findById(id);
        if (!user) {
            throw new NotFoundError("User not found.");
        }
        return mapToPublicUserResponseDto(user);
    }

    async registerUser(registerDto: RegisterDto) : Promise<AuthResponseDto> {

        const deletedUser = await this.userRepository.findDeletedByEmail(registerDto.email);
        if (deletedUser) {
            throw new ConflictError("This email was previously used by a deleted account. Please contact support to recover your account.");
        }

        const existingUserByEmail = await this.userRepository.findByEmail(registerDto.email);
        if (existingUserByEmail) {
            throw new ConflictError("Email already exists.");
        }

        const existingUserByUsername = await this.userRepository.findByUsername(registerDto.username);
        if (existingUserByUsername) {
            throw new ConflictError("Username already exists.");
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(registerDto.password, saltRounds);

        const user = await this.userRepository.createUser({ ...registerDto, password: hashedPassword });
        const responseDto = mapToResponseDto(user);

        const token = this.generateToken(user.id, user.email);

        return { token, user: responseDto };

    }

    async loginUser(loginDto: LoginDto): Promise<AuthResponseDto> {
       
        const user = await this.userRepository.findByEmail(loginDto.email);
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

    async updateUser(authUserId: number, targetUserId: number, updateDto: UpdateDto) : Promise<void> {

        if (authUserId !== targetUserId) {
            throw new ForbiddenError("You are not authorized to update this user.");
        }

        if (updateDto.username) {
            const existingUserByUsername = await this.userRepository.findByUsername(updateDto.username);
            if (existingUserByUsername && existingUserByUsername.id !== targetUserId) {
                throw new ConflictError("Username already exists.");
            }
        }

        if(updateDto.password) {
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(updateDto.password, saltRounds);
            updateDto.password = hashedPassword;
        }

        const isUpdated = await this.userRepository.updateUser(targetUserId, updateDto);
        if (!isUpdated) {
            throw new NotFoundError("User not found.");
        }
    }

    async deleteUser(authUserId: number, targetUserId: number) : Promise<void> {
        if (authUserId !== targetUserId) {
            throw new ForbiddenError("You are not authorized to delete this user.");
        }
         const isDeleted = await this.userRepository.deleteUser(targetUserId);
         if (!isDeleted) {
             throw new NotFoundError("User not found.");
         }
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
import { RegisterDto, UpdateDto, ResponseDto, LoginDto } from "./user.dto";

export const mapToResponseDto = (data: any): ResponseDto => {
    return {
        id: data.id,
        username: data.username,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        isDriver: data.isDriver
    };
};

export const mapToLoginDto = (data: any): LoginDto => {
    return {
        email: data.email,
        password: data.password
    };
};
import { RegisterDto, UpdateDto } from "./user.dto";

export const mapToRegisterDto = (data: any): RegisterDto => {
    return {
        username: data.username,
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName
    };
}

export const mapToUpdateDto = (data: any): UpdateDto => {
    const dto: UpdateDto = {};
    if (data.username !== undefined) dto.username = data.username;
    if (data.password !== undefined) dto.password = data.password;
    if (data.firstName !== undefined) dto.firstName = data.firstName;
    if (data.lastName !== undefined) dto.lastName = data.lastName;
    return dto;
}
export type RegisterDto = {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
}

export type UpdateDto = {
    username?: string;
    password?: string;
    firstName?: string;
    lastName?: string;
}

export type ResponseDto = {
    id: number;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    isDriver: boolean;
}

export type LoginDto = {
    email: string;
    password: string;
}

export type AuthResponseDto = {
    token: string;
    user: ResponseDto;
}
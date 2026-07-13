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
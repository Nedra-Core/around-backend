import { z } from "zod";

export const registerSchema = z.object({
    username: z.string("Username as a string is required").trim().min(3, "Username must be a string and at least 3 characters long.").max(255, "Username must be at most 255 characters long."),
    email: z.string("Email as a string is required").trim().pipe(z.email("Please provide a valid email format")),
    password: z.string("Password as a string is required").min(6, "Password must be at least 6 characters long.").max(255, "Password must be at most 255 characters long."),
    firstName: z.string("First name as a string is required").trim().min(2, "First name must be at least 2 characters.").max(255, "First name must be at most 255 characters long."),
    lastName: z.string("Last name as a string is required").trim().min(2, "Last name must be at least 2 characters.").max(255, "Last name must be at most 255 characters long."),
});

export type RegisterDto = z.infer<typeof registerSchema>;

export const updateSchema = registerSchema.omit({ email: true }).partial().strict().refine(data => Object.keys(data).length > 0, {
    message: "Please provide at least one valid field to update (username, password, firstName, lastName).",
});

export type UpdateDto = z.infer<typeof updateSchema>;

export const loginSchema = z.object({
    email: z.string("Email as a string is required").trim().pipe(z.email("Please provide a valid email format")),
    password: z.string("Password as a string is required").min(1, "Please provide a password."),
});

export type LoginDto = z.infer<typeof loginSchema>;

export type ResponseDto = {
    id: number;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    isDriver: boolean;
}

export type AuthResponseDto = {
    token: string;
    user: ResponseDto;
}
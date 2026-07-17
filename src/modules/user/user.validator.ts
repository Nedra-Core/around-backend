import { ValidationError } from "../../exceptions/custom.errors";

const isValidString = (value: any, minLength: number = 2): boolean => {
    return typeof value === 'string' && value.trim().length >= minLength && value.trim().length <= 255;
};

const isValidEmail = (email: any): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return typeof email === 'string' && emailRegex.test(email);
};

const isStrongPassword = (password: any): boolean => {
    return typeof password === 'string' && password.length >= 6 && password.length <= 255;
};

export const validateLoginData = (data: any): void => {
    if (!data || Object.keys(data).length === 0) {
        throw new ValidationError("Request body is empty.");
    }
    if (!isValidEmail(data.email)) {
        throw new ValidationError("Please provide a valid email format.");
    }
    if (!data.password || typeof data.password !== 'string') {
        throw new ValidationError("Password is required.");
    }
};

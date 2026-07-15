const isValidString = (value: any, minLength: number = 2): boolean => {
    return typeof value === 'string' && value.trim().length >= minLength;
};

const isValidEmail = (email: any): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return typeof email === 'string' && emailRegex.test(email);
};

const isStrongPassword = (password: any): boolean => {
    return typeof password === 'string' && password.length >= 6;
};

export const validateRegisterData = (data: any): void => {
    if (!data || Object.keys(data).length === 0) {
        throw new Error("Validation failed: Request body is empty.");
    }

    if (!isValidString(data.username, 3)) {
        throw new Error("Validation failed: Username must be a string and at least 3 characters long.");
    }

    if (!isValidEmail(data.email)) {
        throw new Error("Validation failed: Please provide a valid email format.");
    }

    if (!isStrongPassword(data.password)) {
        throw new Error("Validation failed: Password must be at least 6 characters long.");
    }

    if (!isValidString(data.firstName, 2) || !isValidString(data.lastName, 2)) {
        throw new Error("Validation failed: First and last names are required and must be at least 2 characters.");
    }

};

export const validateLoginData = (data: any): void => {
    if (!data || Object.keys(data).length === 0) {
        throw new Error("Validation failed: Request body is empty.");
    }
    if (!isValidEmail(data.email)) {
        throw new Error("Validation failed: Please provide a valid email format.");
    }
    if (!data.password || typeof data.password !== 'string') {
        throw new Error("Validation failed: Password is required.");
    }
};

export const validateUpdateData = (data: any): void => {
    if (!data || Object.keys(data).length === 0) {
        throw new Error("Validation failed: Request body is empty. Nothing to update.");
    }

    if(!data.username && !data.password && !data.firstName && !data.lastName) {
            throw new Error("Validation failed: Please provide at least one valid field to update (username, password, firstName, lastName).");
        }

    if (data.firstName !== undefined && !isValidString(data.firstName, 2)) {
        throw new Error("Validation failed: First name must be at least 2 characters.");
    }

    if (data.lastName !== undefined && !isValidString(data.lastName, 2)) {
        throw new Error("Validation failed: Last name must be at least 2 characters.");
    }

    if (data.password !== undefined && !isStrongPassword(data.password)) {
        throw new Error("Validation failed: New password must be at least 6 characters.");
    }
};
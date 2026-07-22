export class BaseError extends Error {
    public readonly statusCode: number;
    public readonly code: string;       

    constructor(message: string, statusCode: number, code: string) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;

        Object.setPrototypeOf(this, new.target.prototype);
        Error.captureStackTrace(this, this.constructor);
    }
}

export class ConflictError extends BaseError {
    constructor(message: string) {
        super(message, 409, "CONFLICT_ERROR");
    }
}

export class UnauthorizedError extends BaseError {
    constructor(message: string = "Invalid credentials.") {
        super(message, 401, "UNAUTHORIZED");
    }
}

export class ValidationError extends BaseError {
    constructor(message: string) {
        super(message, 400, "VALIDATION_ERROR");
    }
}

export class NotFoundError extends BaseError {
    constructor(message: string) {
        super(message, 404, "NOT_FOUND");
    }
}
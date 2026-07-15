import { BaseError } from "./base.error";

export class UnauthorizedError extends BaseError {
    constructor(message: string = "Invalid credentials.") {
        super(message, 401, "UNAUTHORIZED");
    }
}
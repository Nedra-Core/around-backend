import { Router } from "express";
import { Request, Response } from "express";
import { userService } from "../../container";
import { mapToLoginDto } from "./user.mapper";
import { asyncHandler } from "../../middlewares/async-handler";
import { validateLoginData } from "./user.validator";
import { authGuard, AuthRequest } from "../../middlewares/auth";
import { registerSchema, updateSchema } from "./user.dto";
import { validate } from "../../middlewares/validateResource";

export class UserController {
    public router: Router;

    constructor() {
        this.router = Router();
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get('/', authGuard, this.getUsers);
        this.router.post('/', validate(registerSchema), this.registerUser);
        this.router.post('/login', this.loginUser);
        this.router.put('/:id', authGuard, validate(updateSchema), this.updateUser);
        this.router.delete('/:id', authGuard, this.deleteUser);
    }

    getUsers = asyncHandler(async (req: Request, res: Response) => {

        const users = await userService.getAllUsers();
        res.json(users);

    });

    registerUser = asyncHandler(async (req: Request, res: Response) => {

        const registerDto = req.body;
        const newUser = await userService.registerUser(registerDto);
        res.status(201).json(newUser);
    });

    loginUser = asyncHandler(async (req: Request, res: Response) => {

        validateLoginData(req.body);

        const loginDto = mapToLoginDto(req.body);
        const authData = await userService.loginUser(loginDto);
        res.status(200).json(authData);
    });

    updateUser = asyncHandler(async (req: AuthRequest, res: Response) => {

        const targetUserId = Number(req.params.id);
        const authUserId = req.auth?.id;
        const updateDto = req.body;
        await userService.updateUser(authUserId, targetUserId, updateDto);
        res.status(200).json({ message: "User updated successfully" });

    });

    deleteUser = asyncHandler(async (req: AuthRequest, res: Response) => {

        const targetUserId = Number(req.params.id);
        const authUserId = req.auth?.id;
        await userService.deleteUser(authUserId, targetUserId);
        res.status(200).json({ message: "User deleted successfully" });

    });

}
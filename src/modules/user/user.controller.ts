import { Router } from "express";
import { Request, Response } from "express";
import { UserService } from "./user.service";
import { asyncHandler } from "../../middlewares/async.handler";
import { authGuard, AuthRequest } from "../../middlewares/auth";
import { registerSchema, updateSchema, loginSchema } from "./user.dto";
import { idParamSchema, validate } from "../../middlewares/resource.validator";

export class UserController {
    public router: Router;

    constructor( private userService: UserService) {
        this.router = Router();
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get('/me', authGuard, this.getMe);
        this.router.get('/:id', authGuard, validate(idParamSchema(), 'params'), this.getPublicProfile);
        this.router.post('/', validate(registerSchema), this.registerUser);
        this.router.post('/login', validate(loginSchema), this.loginUser);
        this.router.put('/:id', authGuard, validate(idParamSchema(), 'params'), validate(updateSchema), this.updateUser);
        this.router.delete('/:id', authGuard, validate(idParamSchema(), 'params'), this.deleteUser);
    }

    getMe = asyncHandler(async (req: AuthRequest, res: Response) => {

        const myId = req.auth!.id;
        const user = await this.userService.getMyProfile(myId);
        res.status(200).json(user);
    });

    getPublicProfile = asyncHandler(async (req: Request, res: Response) => {

        const { id: targetUserId } = req.params as unknown as { id: number };
        const user = await this.userService.getPublicProfile(targetUserId);
        res.status(200).json(user);
    });

    registerUser = asyncHandler(async (req: Request, res: Response) => {

        const registerDto = req.body;
        const newUser = await this.userService.registerUser(registerDto);
        res.status(201).json(newUser);
    });

    loginUser = asyncHandler(async (req: Request, res: Response) => {

        const loginDto = req.body;
        const authData = await this.userService.loginUser(loginDto);
        res.status(200).json(authData);
    });

    updateUser = asyncHandler(async (req: AuthRequest, res: Response) => {

        const { id: targetUserId } = req.params as unknown as { id: number };
        const authUserId = req.auth!.id;
        const updateDto = req.body;
        await this.userService.updateUser(authUserId, targetUserId, updateDto);
        res.status(200).json({ message: "User updated successfully" });

    });

    deleteUser = asyncHandler(async (req: AuthRequest, res: Response) => {

        const { id: targetUserId } = req.params as unknown as { id: number };
        const authUserId = req.auth!.id;
        await this.userService.deleteUser(authUserId, targetUserId);
        res.status(200).json({ message: "User deleted successfully" });

    });

}
import { Router } from "express";
import { Request, Response } from "express";
import { userService } from "../../container";
import { mapToLoginDto, mapToRegisterDto, mapToUpdateDto } from "./user.mapper";
import { asyncHandler } from "../../middlewares/async-handler";

export class UserController {
    public router: Router;

    constructor() {
        this.router = Router();
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get('/', this.getUsers);
        this.router.post('/', this.registerUser);
        this.router.post('/login', this.loginUser);
        this.router.put('/:id', this.updateUser);
        this.router.delete('/:id', this.deleteUser);
    }

    getUsers = asyncHandler(async (req: Request, res: Response) => {

        const users = await userService.getAllUsers();
        res.json(users);

    });

    registerUser = asyncHandler(async (req: Request, res: Response) => {

        const registerDto = mapToRegisterDto(req.body);
        const newUser = await userService.registerUser(registerDto);
        res.status(201).json(newUser);
    });

    loginUser = asyncHandler(async (req: Request, res: Response) => {
        const loginDto = mapToLoginDto(req.body);
        const user = await userService.loginUser(loginDto);
        res.status(200).json(user);
    });

    updateUser = asyncHandler(async (req: Request, res: Response) => {

        const id = Number(req.params.id);
        const updateDto = mapToUpdateDto(req.body);
        await userService.updateUser(id, updateDto);
        res.status(200).json({ message: "User updated successfully" });

    });

    deleteUser = asyncHandler(async (req: Request, res: Response) => {

        const id = Number(req.params.id);
        await userService.deleteUser(id);
        res.status(200).json({ message: "User deleted successfully" });

    });

}
import { Router } from "express";
import { Request, Response } from "express";
import { userService } from "../../container";
import { mapToLoginDto, mapToRegisterDto, mapToUpdateDto } from "./user.mapper";
import { asyncHandler } from "../../middlewares/async-handler";
import { validateLoginData, validateRegisterData, validateUpdateData } from "./user.validator";

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

        validateRegisterData(req.body);

        const registerDto = mapToRegisterDto(req.body);
        const newUser = await userService.registerUser(registerDto);
        res.status(201).json(newUser);
    });

    loginUser = asyncHandler(async (req: Request, res: Response) => {

        validateLoginData(req.body);

        const loginDto = mapToLoginDto(req.body);
        const authData = await userService.loginUser(loginDto);
        res.status(200).json(authData);
    });

    updateUser = asyncHandler(async (req: Request, res: Response) => {

        validateUpdateData(req.body);

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
import { Router } from "express";
import {Request, Response} from "express";
import { userService } from "../../container";
import { mapToRegisterDto, mapToUpdateDto } from "./user.mapper";

export class UserController {
    public router: Router;

    constructor() {
        this.router = Router();
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get('/', this.getUsers);
        this.router.post('/', this.registerUser);
        this.router.put('/:id', this.updateUser);
        this.router.delete('/:id', this.deleteUser);
    }

    getUsers = async (req: Request, res: Response) => {
        try{
            const users = await userService.getAllUsers();
            res.json(users);

        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    };

    registerUser = async (req: Request, res: Response) => {
        try{
            const registerDto = mapToRegisterDto(req.body);
            const newUser = await userService.registerUser(registerDto);
            res.status(201).json(newUser);
        } catch (error: any) {
            if (error.message.includes("Validation failed")) {
                res.status(400).json({ error: error.message });
            } else {
                res.status(500).json({ error: error.message });
            }
        }
    };

    updateUser = async (req: Request, res: Response) => {
        try {
            const id = Number(req.params.id);
            const updateDto = mapToUpdateDto(req.body);
            await userService.updateUser(id, updateDto);
            res.status(200).json({ message: "User updated successfully" });
        } catch(error: any) {
            if (error.message.includes("Validation failed")) {
                res.status(400).json({ error: error.message });
            } else {
                res.status(500).json({ error: error.message });
            }
        }
    };

    deleteUser = async (req: Request, res: Response) => {
        try {
            const id = Number(req.params.id);
            await userService.deleteUser(id);
            res.status(200).json({ message: "User deleted successfully" });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    };

}
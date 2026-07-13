import { Router } from "express";
import {Request, Response} from "express";
import { userService } from "../../container";

export class UserController {
    public router: Router;

    constructor() {
        this.router = Router();
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get('/', this.getUsers);
        this.router.post('/', this.registerUser);
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
            const User = req.body;
            const newUser = await userService.registerUser(User);
            res.status(201).json(newUser);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
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
    }

}
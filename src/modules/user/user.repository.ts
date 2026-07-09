import { AppDataSource } from "../../config/database";
import { User} from "./user.entity";

export class UserRepository {
    private userRepository = AppDataSource.getRepository(User);

    async findAll(): Promise<User[]> {
        return await this.userRepository.find();
    }

    async createUser(userData: User): Promise<User> {
        const user = this.userRepository.create(userData);
        return await this.userRepository.save(user);
    }

}
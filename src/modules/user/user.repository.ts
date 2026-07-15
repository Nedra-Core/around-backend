import { AppDataSource } from "../../config/database";
import { RegisterDto, UpdateDto } from "./user.dto";
import { User} from "./user.entity";

export class UserRepository {
    private userRepository = AppDataSource.getRepository(User);

    async findByEmail(email: string): Promise<User | null> {
        return await this.userRepository.findOne({ where: { email, isDeleted: false } });
    }

    async findByUsername(username: string): Promise<User | null> {
        return await this.userRepository.findOne({ where: { username, isDeleted: false } });
    }

    async findAll(): Promise<User[]> {
        return await this.userRepository.find({where: { isDeleted: false }});
    }

    async createUser(registerDto: RegisterDto): Promise<User> {
        const user = this.userRepository.create(registerDto);
        return await this.userRepository.save(user);
    }

    async updateUser(userId: number, updateDto: UpdateDto) : Promise<void> {
        await this.userRepository.update(userId, updateDto);
    }

    async deleteUser(userId: number) : Promise<void> {
        await this.userRepository.update(userId, { isDeleted: true });
    }

}
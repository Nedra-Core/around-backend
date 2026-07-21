import { DataSource, Repository } from "typeorm";
import { RegisterDto, UpdateDto } from "./user.dto";
import { User} from "./user.entity";

export class UserRepository {
    private userRepository: Repository<User>;

    constructor(private dataSource: DataSource) {
        this.userRepository = this.dataSource.getRepository(User);
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.userRepository.findOne({ where: { email, isDeleted: false } });
    }

    async findByUsername(username: string): Promise<User | null> {
        return this.userRepository.findOne({ where: { username, isDeleted: false } });
    }

    async findAll(): Promise<User[]> {
        return this.userRepository.find({where: { isDeleted: false }});
    }

    async createUser(registerDto: RegisterDto): Promise<User> {
        const user = this.userRepository.create(registerDto);
        return this.userRepository.save(user);
    }

    async updateUser(userId: number, updateDto: UpdateDto) : Promise<void> {
        await this.userRepository.update(userId, updateDto);
    }

    async deleteUser(userId: number) : Promise<void> {
        await this.userRepository.update(userId, { isDeleted: true });
    }

}
import { DataSource, Repository } from "typeorm";
import { RegisterDto, UpdateDto } from "./user.dto";
import { User} from "./user.entity";

export class UserRepository {
    private userRepository: Repository<User>;

    constructor(private dataSource: DataSource) {
        this.userRepository = this.dataSource.getRepository(User);
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.userRepository.findOne({ where: { email} });
    }

    async findDeletedByEmail(email: string): Promise<User | null> {
        return this.userRepository.findOne({ where: { email}, withDeleted: true });
    }

    async findByUsername(username: string): Promise<User | null> {
        return this.userRepository.findOne({ where: { username} });
    }

    async findAll(): Promise<User[]> {
        return this.userRepository.find();
    }

    async createUser(registerDto: RegisterDto): Promise<User> {
        const user = this.userRepository.create(registerDto);
        return this.userRepository.save(user);
    }

    async updateUser(userId: number, updateDto: UpdateDto) : Promise<boolean> {
        const result = await this.userRepository.update(userId, updateDto);
        return result.affected !== undefined && result.affected > 0;
    }

    async deleteUser(userId: number) : Promise<boolean> {
        const result = await this.userRepository.softDelete(userId);
        return result.affected !== undefined && result.affected > 0;
    }

}
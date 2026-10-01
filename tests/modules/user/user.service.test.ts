import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserService } from '../../../src/modules/user/user.service';
import { UserRepository } from '../../../src/modules/user/user.repository';
import { User } from '../../../src/modules/user/user.entity';
import { ConflictError, ForbiddenError, NotFoundError, UnauthorizedError } from '../../../src/exceptions/custom.errors';

const JWT_SECRET = 'test-secret';
const PASSWORD = 'secret123';

const registerDto = {
    username: 'maria',
    email: 'maria@example.com',
    password: PASSWORD,
    firstName: 'Maria',
    lastName: 'Ivanova',
};

const makeUser = (overrides: Partial<User> = {}): User => ({
    id: 1,
    username: 'maria',
    email: 'maria@example.com',
    password: bcrypt.hashSync(PASSWORD, 4),
    firstName: 'Maria',
    lastName: 'Ivanova',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    ...overrides,
});

describe('UserService', () => {
    let userRepository: {
        findById: ReturnType<typeof vi.fn>;
        findByEmail: ReturnType<typeof vi.fn>;
        findByUsername: ReturnType<typeof vi.fn>;
        findDeletedByEmail: ReturnType<typeof vi.fn>;
        createUser: ReturnType<typeof vi.fn>;
        updateUser: ReturnType<typeof vi.fn>;
        deleteUser: ReturnType<typeof vi.fn>;
    };
    let service: UserService;

    beforeEach(() => {
        vi.stubEnv('JWT_SECRET', JWT_SECRET);
        userRepository = {
            findById: vi.fn().mockResolvedValue(null),
            findByEmail: vi.fn().mockResolvedValue(null),
            findByUsername: vi.fn().mockResolvedValue(null),
            findDeletedByEmail: vi.fn().mockResolvedValue(null),
            createUser: vi.fn(),
            updateUser: vi.fn(),
            deleteUser: vi.fn(),
        };
        service = new UserService(userRepository as unknown as UserRepository);
    });

    afterEach(() => {
        vi.unstubAllEnvs();
    });

    describe('getMyProfile', () => {
        it('returns the user without their password', async () => {
            userRepository.findById.mockResolvedValue(makeUser());

            const result = await service.getMyProfile(1);

            expect(result).toEqual({
                id: 1,
                username: 'maria',
                email: 'maria@example.com',
                firstName: 'Maria',
                lastName: 'Ivanova',
            });
            expect(result).not.toHaveProperty('password');
        });

        it('throws NotFoundError when the user does not exist', async () => {
            await expect(service.getMyProfile(1)).rejects.toThrow(NotFoundError);
        });
    });

    describe('getPublicProfile', () => {
        it('returns the user without their email or password', async () => {
            userRepository.findById.mockResolvedValue(makeUser());

            const result = await service.getPublicProfile(1);

            expect(result).toEqual({
                id: 1,
                username: 'maria',
                firstName: 'Maria',
                lastName: 'Ivanova',
            });
            expect(result).not.toHaveProperty('email');
            expect(result).not.toHaveProperty('password');
        });

        it('throws NotFoundError when the user does not exist', async () => {
            await expect(service.getPublicProfile(1)).rejects.toThrow(NotFoundError);
        });
    });

    describe('registerUser', () => {
        it('rejects an email that belonged to a deleted account', async () => {
            userRepository.findDeletedByEmail.mockResolvedValue(makeUser());

            await expect(service.registerUser(registerDto)).rejects.toThrow(ConflictError);
            expect(userRepository.createUser).not.toHaveBeenCalled();
        });

        it('rejects an email that is already taken', async () => {
            userRepository.findByEmail.mockResolvedValue(makeUser());

            await expect(service.registerUser(registerDto)).rejects.toThrow('Email already exists.');
            expect(userRepository.createUser).not.toHaveBeenCalled();
        });

        it('rejects a username that is already taken', async () => {
            userRepository.findByUsername.mockResolvedValue(makeUser());

            await expect(service.registerUser(registerDto)).rejects.toThrow('Username already exists.');
            expect(userRepository.createUser).not.toHaveBeenCalled();
        });

        it('stores a hashed password, not the plain one', async () => {
            userRepository.createUser.mockImplementation(async (data) => makeUser({ ...data, id: 1 }));

            await service.registerUser(registerDto);

            const savedPassword = userRepository.createUser.mock.calls[0][0].password;
            expect(savedPassword).not.toBe(PASSWORD);
            expect(await bcrypt.compare(PASSWORD, savedPassword)).toBe(true);
        });

        it('returns a valid token and the user without the password', async () => {
            userRepository.createUser.mockImplementation(async (data) => makeUser({ ...data, id: 1 }));

            const result = await service.registerUser(registerDto);

            expect(result.user).toEqual({
                id: 1,
                username: 'maria',
                email: 'maria@example.com',
                firstName: 'Maria',
                lastName: 'Ivanova',
            });
            expect(jwt.verify(result.token, JWT_SECRET)).toMatchObject({ id: 1, email: 'maria@example.com' });
        });
    });

    describe('loginUser', () => {
        it('rejects an unknown email', async () => {
            await expect(service.loginUser({ email: 'nobody@example.com', password: PASSWORD }))
                .rejects.toThrow(UnauthorizedError);
        });

        it('rejects a wrong password with the same message as an unknown email', async () => {
            userRepository.findByEmail.mockResolvedValue(makeUser());

            await expect(service.loginUser({ email: 'maria@example.com', password: 'wrong-password' }))
                .rejects.toThrow('Invalid email or password.');
        });

        it('returns a valid token for the correct password', async () => {
            userRepository.findByEmail.mockResolvedValue(makeUser());

            const result = await service.loginUser({ email: 'maria@example.com', password: PASSWORD });

            expect(result.user).not.toHaveProperty('password');
            expect(jwt.verify(result.token, JWT_SECRET)).toMatchObject({ id: 1, email: 'maria@example.com' });
        });

        it('fails when JWT_SECRET is missing', async () => {
            vi.stubEnv('JWT_SECRET', '');
            userRepository.findByEmail.mockResolvedValue(makeUser());

            await expect(service.loginUser({ email: 'maria@example.com', password: PASSWORD }))
                .rejects.toThrow('JWT_SECRET is not defined');
        });
    });

    describe('updateUser', () => {
        it('does not let a user update someone else', async () => {
            await expect(service.updateUser(1, 2, { firstName: 'Ivan' })).rejects.toThrow(ForbiddenError);
            expect(userRepository.updateUser).not.toHaveBeenCalled();
        });

        it('rejects a username that belongs to another user', async () => {
            userRepository.findByUsername.mockResolvedValue(makeUser({ id: 2, username: 'ivan' }));

            await expect(service.updateUser(1, 1, { username: 'ivan' })).rejects.toThrow('Username already exists.');
            expect(userRepository.updateUser).not.toHaveBeenCalled();
        });

        it('allows keeping your own username', async () => {
            userRepository.findByUsername.mockResolvedValue(makeUser({ id: 1, username: 'maria' }));
            userRepository.updateUser.mockResolvedValue(true);

            await service.updateUser(1, 1, { username: 'maria', firstName: 'Mariya' });

            expect(userRepository.updateUser).toHaveBeenCalledWith(1, { username: 'maria', firstName: 'Mariya' });
        });

        it('hashes a new password before saving it', async () => {
            userRepository.updateUser.mockResolvedValue(true);

            await service.updateUser(1, 1, { password: 'new-secret' });

            const savedPassword = userRepository.updateUser.mock.calls[0][1].password;
            expect(savedPassword).not.toBe('new-secret');
            expect(await bcrypt.compare('new-secret', savedPassword)).toBe(true);
        });

        it('saves other fields as they are', async () => {
            userRepository.updateUser.mockResolvedValue(true);

            await service.updateUser(1, 1, { firstName: 'Ivan' });

            expect(userRepository.updateUser).toHaveBeenCalledWith(1, { firstName: 'Ivan' });
        });

        it('throws NotFoundError when the user does not exist', async () => {
            userRepository.updateUser.mockResolvedValue(false);

            await expect(service.updateUser(1, 1, { firstName: 'Ivan' })).rejects.toThrow(NotFoundError);
        });
    });

    describe('deleteUser', () => {
        it('does not let a user delete someone else', async () => {
            await expect(service.deleteUser(1, 2)).rejects.toThrow(ForbiddenError);
            expect(userRepository.deleteUser).not.toHaveBeenCalled();
        });

        it('deletes the user', async () => {
            userRepository.deleteUser.mockResolvedValue(true);

            await service.deleteUser(1, 1);

            expect(userRepository.deleteUser).toHaveBeenCalledWith(1);
        });

        it('throws NotFoundError when the user does not exist', async () => {
            userRepository.deleteUser.mockResolvedValue(false);

            await expect(service.deleteUser(1, 1)).rejects.toThrow(NotFoundError);
        });
    });
});

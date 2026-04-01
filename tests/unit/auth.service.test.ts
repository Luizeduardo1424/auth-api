import { AuthService } from '../../src/modules/auth/auth.service';
import { IAuthRepository } from '../../src/modules/auth/auth.repository.interface';
import { AppError } from '../../src/shared/errors/AppError';
import { describe, it, expect, beforeEach, jest} from '@jest/globals'

const makeRepositoryMock = (): jest.Mocked<IAuthRepository> => ({
  findByEmail: jest.fn(),
  findByUsername: jest.fn(),
  create: jest.fn(),
  saveRefreshToken: jest.fn(),
  findRefreshToken: jest.fn(),
  revokeRefreshToken: jest.fn(),
});

describe('AuthService', () => {
  let service: AuthService;
  let repository: jest.Mocked<IAuthRepository>;

  beforeEach(() => {
    repository = makeRepositoryMock();
    service = new AuthService(repository);
  });

  describe('register', () => {
    const validInput = {
      email: 'test@example.com',
      username: 'testuser',
      password: 'Test1234',
    };

    it('should register a new user and return tokens', async () => {
      repository.findByEmail.mockResolvedValue(null);
      repository.findByUsername.mockResolvedValue(null);
      repository.create.mockResolvedValue({
        id: 'uuid-123',
        email: validInput.email,
        username: validInput.username,
        password: 'hashed',
        is_active: true,
        is_verified: false,
        created_at: new Date(),
        updated_at: new Date(),
      });
      repository.saveRefreshToken.mockResolvedValue(undefined);

      const result = await service.register(validInput);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.email).toBe(validInput.email);
      expect(repository.create).toHaveBeenCalledTimes(1);
    });

    it('should throw 409 if email already exists', async () => {
      repository.findByEmail.mockResolvedValue({
        id: 'uuid-123',
        email: validInput.email,
        username: 'other',
        password: 'hashed',
        is_active: true,
        is_verified: false,
        created_at: new Date(),
        updated_at: new Date(),
      });

      await expect(service.register(validInput)).rejects.toThrow(
        new AppError('Email already in use', 409),
      );
      expect(repository.create).not.toHaveBeenCalled();
    });

    it('should throw 409 if username already exists', async () => {
      repository.findByEmail.mockResolvedValue(null);
      repository.findByUsername.mockResolvedValue({
        id: 'uuid-456',
        email: 'other@example.com',
        username: validInput.username,
        password: 'hashed',
        is_active: true,
        is_verified: false,
        created_at: new Date(),
        updated_at: new Date(),
      });

      await expect(service.register(validInput)).rejects.toThrow(
        new AppError('Username already in use', 409),
      );
    });
  });

  describe('login', () => {
    it('should throw 401 if user not found', async () => {
      repository.findByEmail.mockResolvedValue(null);

      await expect(
        service.login({ email: 'nope@example.com', password: 'Test1234' }),
      ).rejects.toThrow(new AppError('Invalid credentials', 401));
    });

    it('should throw 401 if password is wrong', async () => {
      repository.findByEmail.mockResolvedValue({
        id: 'uuid-123',
        email: 'test@example.com',
        username: 'testuser',
        password: '$2b$12$invalidhash',
        is_active: true,
        is_verified: false,
        created_at: new Date(),
        updated_at: new Date(),
      });

      await expect(
        service.login({ email: 'test@example.com', password: 'WrongPass1' }),
      ).rejects.toThrow(new AppError('Invalid credentials', 401));
    });

    it('should throw 403 if account is disabled', async () => {
      repository.findByEmail.mockResolvedValue({
        id: 'uuid-123',
        email: 'test@example.com',
        username: 'testuser',
        password: '$2b$12$NJKdkylbEdV4GRnCRdSrRuMGsDuwzp9VAieXixneAilmVLOQVDZ6G',
        is_active: false,
        is_verified: false,
        created_at: new Date(),
        updated_at: new Date(),
      });

      await expect(
        service.login({ email: 'test@example.com', password: 'Test1234' }),
      ).rejects.toThrow(new AppError('Account is disabled', 403));
    });
  });
});
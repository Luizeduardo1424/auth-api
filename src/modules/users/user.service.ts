import bcrypt from 'bcrypt';
import { env } from '../../config/env';
import { AppError } from '../../shared/errors/AppError';
import { IUserRepository } from './user.repository.interface';
import { ChangePasswordInput, UpdateUserInput } from './user.schemas';

export class UserService {
  constructor(private readonly repository: IUserRepository) {}

  async getMe(userId: string) {
    const user = await this.repository.findById(userId);
    if (!user) throw new AppError('User not found', 404);
    return user;
  }

  async updateMe(userId: string, data: UpdateUserInput) {
    const user = await this.repository.findById(userId);
    if (!user) throw new AppError('User not found', 404);
    return this.repository.updateById(userId, data);
  }

  async deleteMe(userId: string) {
    const user = await this.repository.findById(userId);
    if (!user) throw new AppError('User not found', 404);
    await this.repository.deleteById(userId);
  }

  async changePassword(userId: string, data: ChangePasswordInput) {
    const currentHash = await this.repository.findPasswordById(userId);
    if (!currentHash) throw new AppError('User not found', 404);

    const passwordMatch = await bcrypt.compare(data.currentPassword, currentHash);
    if (!passwordMatch) throw new AppError('Current password is incorrect', 401);

    const hashedPassword = await bcrypt.hash(data.newPassword, env.BCRYPT_SALT_ROUNDS);
    await this.repository.updatePassword(userId, hashedPassword);
  }
}

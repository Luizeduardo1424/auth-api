import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env';
import { AppError } from '../../shared/errors/AppError';
import { JwtPayload } from '../../shared/types';
import { IAuthRepository } from './auth.repository.interface';
import { LoginInput, RegisterInput } from './auth.schemas';

const generatedToken = (payload: JwtPayload) => {
  const accessToken = jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN,
  } as jwt.SignOptions);

  const refreshToken = jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
  } as jwt.SignOptions);

  return { accessToken, refreshToken };
};

const getRefreshTokenExpiry = (): Date => {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);
  return expiresAt;
};

export class AuthService {
  constructor(public readonly repository: IAuthRepository) {}

  async register(data: RegisterInput) {
    const [existingEmail, existingUsername] = await Promise.all([
      this.repository.findByEmail(data.email),
      this.repository.findByUsername(data.username),
    ]);

    if (existingEmail) throw new AppError('Email already in use', 409);
    if (existingUsername) throw new AppError('Username already in use', 409);

    const hashedPassword = await bcrypt.hash(data.password, env.BCRYPT_SALT_ROUNDS);
    const user = await this.repository.create({ ...data, hashedPassword });

    const payload: JwtPayload = { sub: user.id, email: user.email };
    const { accessToken, refreshToken } = generatedToken(payload);

    await this.repository.saveRefreshToken(user.id, refreshToken, getRefreshTokenExpiry());

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
      accessToken,
      refreshToken,
    };
  }

  async login(data: LoginInput) {
    const user = await this.repository.findByEmail(data.email);

    if (!user) throw new AppError('Invalid credentials', 401);

    const passwordMatch = await bcrypt.compare(data.password, user.password);
    if (!passwordMatch) throw new AppError('Invalid credentials', 401);

    if (!user.is_active) throw new AppError('Account is disabled', 403);

    const payload: JwtPayload = { sub: user.id, email: user.email };
    const { accessToken, refreshToken } = generatedToken(payload);

    await this.repository.saveRefreshToken(user.id, refreshToken, getRefreshTokenExpiry());

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
      accessToken,
      refreshToken,
    };
  }
}

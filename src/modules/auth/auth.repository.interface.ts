import { RegisterInput } from './auth.schemas';

export interface User {
  id: string;
  email: string;
  username: string;
  password: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface IAuthRepository {
  findByEmail(email: string): Promise<User | null>;

  findByUsername(name: string): Promise<User | null>;

  create(data: RegisterInput & { hashedPassword: string }): Promise<User>;

  saveRefreshToken(userId: string, token: string, expiresAt: Date): Promise<void>;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  findRefreshToken(token: string): Promise<any>;

  revokeRefreshToken(token: string): Promise<void>;
}

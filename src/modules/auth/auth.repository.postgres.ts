import { pool } from '../../database/pool';
import { RegisterInput } from './auth.schemas';
import { IAuthRepository, User } from './auth.repository.interface';

export class PostgresAuthRepository implements IAuthRepository {
  async findByEmail(email: string): Promise<User | null> {
    const result = await pool.query<User>('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0] ?? null;
  }

  async findByUsername(username: string): Promise<User | null> {
    const result = await pool.query<User>('SELECT * FROM users WHERE username = $1', [username]);
    return result.rows[0] ?? null;
  }

  async create(data: RegisterInput & { hashedPassword: string }): Promise<User> {
    const result = await pool.query<User>(
      `INSERT INTO users (email, username, password)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [data.email, data.username, data.hashedPassword],
    );
    return result.rows[0];
  }

  async saveRefreshToken(userId: string, token: string, expiresAt: Date): Promise<void> {
    await pool.query(
      `INSERT INTO refresh_tokens (user_id, token, expires_at)
       VALUES ($1, $2, $3)`,
      [userId, token, expiresAt],
    );
  }

  async findRefreshToken(token: string) {
    const result = await pool.query(
      `SELECT * FROM refresh_tokens
       WHERE token = $1 AND revoked_at IS NULL AND expires_at > NOW()`,
      [token],
    );
    return result.rows[0] ?? null;
  }

  async revokeRefreshToken(token: string): Promise<void> {
    await pool.query('UPDATE refresh_tokens SET revoked_at = NOW() WHERE token = $1', [token]);
  }
}

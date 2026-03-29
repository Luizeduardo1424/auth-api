import { pool } from '../../database/pool';
import { IUserRepository, UserPublic } from './user.repository.interface';

export class PostgresUserRepository implements IUserRepository {
  async findById(id: string): Promise<UserPublic | null> {
    const result = await pool.query<UserPublic>(
      `SELECT id, email, username, is_active, is_verified, created_at, updated_at
       FROM users WHERE id = $1`,
      [id],
    );
    return result.rows[0] ?? null;
  }

  async updateById(
    id: string,
    data: Partial<Pick<UserPublic, 'email' | 'username'>>,
  ): Promise<UserPublic> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let index = 1;

    if (data.email) {
      fields.push(`email = $${index++}`);
      values.push(data.email);
    }
    if (data.username) {
      fields.push(`username = $${index++}`);
      values.push(data.username);
    }

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const result = await pool.query<UserPublic>(
      `UPDATE users SET ${fields.join(', ')}
       WHERE id = $${index}
       RETURNING id, email, username, is_active, is_verified, created_at, updated_at`,
      values,
    );
    return result.rows[0];
  }

  async deleteById(id: string): Promise<void> {
    await pool.query('DELETE FROM users WHERE id = $1', [id]);
  }

  async updatePassword(id: string, hashedPassword: string): Promise<void> {
    await pool.query('UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2', [
      hashedPassword,
      id,
    ]);
  }

  async findPasswordById(id: string): Promise<string | null> {
    const result = await pool.query<{ password: string }>(
      'SELECT password FROM users WHERE id = $1',
      [id],
    );
    return result.rows[0]?.password ?? null;
  }
}

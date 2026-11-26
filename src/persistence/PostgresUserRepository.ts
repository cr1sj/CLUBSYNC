import { Pool } from 'pg';
import { AppError } from '../domain/errors';
import { Role, User, UserRepository } from '../domain/user';

const COLS = `id, name, email, password_hash AS "passwordHash", role`;

export class PostgresUserRepository implements UserRepository {
  constructor(private readonly pool: Pool) {}

  async insert(name: string, email: string, passwordHash: string, role: Role): Promise<User> {
    try {
      const r = await this.pool.query(
        `INSERT INTO users(name, email, password_hash, role) VALUES ($1,$2,$3,$4) RETURNING ${COLS}`,
        [name, email, passwordHash, role],
      );
      return r.rows[0] as User;
    } catch (error) {
      if ((error as { code?: string }).code === '23505') throw new AppError(409, 'El email ya está registrado.');
      throw error;
    }
  }

  async findByEmail(email: string): Promise<User | undefined> {
    const r = await this.pool.query(`SELECT ${COLS} FROM users WHERE email = $1`, [email]);
    return r.rows[0] as User | undefined;
  }
}
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { jwtSecret } from '../config';
import { AppError } from '../domain/errors';
import { Role, UserRepository } from '../domain/user';

export class AuthService {
  constructor(private readonly users: UserRepository) {}

  async register(input: unknown) {
    const b = (input ?? {}) as Record<string, unknown>;
    if (typeof b.name !== 'string' || b.name.trim() === '') throw new AppError(400, 'name es obligatorio.');
    if (typeof b.email !== 'string' || !b.email.includes('@')) throw new AppError(400, 'email inválido.');
    if (typeof b.password !== 'string' || b.password.length < 6) throw new AppError(400, 'password debe tener al menos 6 caracteres.');
    const role: Role = b.role === 'admin' ? 'admin' : 'estudiante'; // solo para demo
    const hash = await bcrypt.hash(b.password, 10);
    const user = await this.users.insert(b.name.trim(), b.email.trim().toLowerCase(), hash, role);
    return { id: user.id, name: user.name, email: user.email, role: user.role };
  }

  async login(input: unknown) {
    const b = (input ?? {}) as Record<string, unknown>;
    if (typeof b.email !== 'string' || typeof b.password !== 'string') {
      throw new AppError(400, 'email y password son obligatorios.');
    }
    const user = await this.users.findByEmail(b.email.trim().toLowerCase());
    if (!user || !(await bcrypt.compare(b.password, user.passwordHash))) {
      throw new AppError(401, 'Credenciales incorrectas.');
    }
    const token = jwt.sign({ id: user.id, role: user.role }, jwtSecret(), { expiresIn: 7200 });
    return { token, role: user.role };
  }
}
export type Role = 'admin' | 'estudiante';

export interface User {
  id: number;
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
}

export interface UserRepository {
  insert(name: string, email: string, passwordHash: string, role: Role): Promise<User>;
  findByEmail(email: string): Promise<User | undefined>;
}
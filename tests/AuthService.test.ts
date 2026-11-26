import bcrypt from 'bcryptjs';
import { describe, expect, it, vi } from 'vitest';
import { AuthService } from '../src/application/AuthService';
import { User, UserRepository } from '../src/domain/user';

async function setup() {
  const user: User = { id: 1, name: 'Ana', email: 'ana@test.com', passwordHash: await bcrypt.hash('123456', 4), role: 'estudiante' };
  const users: UserRepository = {
    insert: vi.fn(async (name, email, passwordHash, role) => ({ id: 2, name, email, passwordHash, role })),
    findByEmail: vi.fn(async (email: string) => (email === user.email ? user : undefined)),
  };
  return { service: new AuthService(users), users };
}

describe('AuthService', () => {
  it('AUTH-02: registra al usuario guardando un hash y nunca la contraseña', async () => {
    const { service, users } = await setup();
    const out = await service.register({ name: 'Luis', email: 'LUIS@test.com', password: '123456' });
    expect(out).toEqual({ id: 2, name: 'Luis', email: 'luis@test.com', role: 'estudiante' });
    const hash = (users.insert as ReturnType<typeof vi.fn>).mock.calls[0][2] as string;
    expect(hash).not.toBe('123456');
    expect(hash.startsWith('$2')).toBe(true);
  });

  it('AUTH-02: rechaza un email inválido con 400', async () => {
    const { service } = await setup();
    await expect(service.register({ name: 'Luis', email: 'sin-arroba', password: '123456' }))
      .rejects.toMatchObject({ status: 400 });
  });

  it('AUTH-05: el login correcto devuelve token y rol', async () => {
    const { service } = await setup();
    const out = await service.login({ email: 'ana@test.com', password: '123456' });
    expect(out.role).toBe('estudiante');
    expect(out.token.split('.')).toHaveLength(3);
  });

  it('AUTH-07: la contraseña incorrecta responde 401', async () => {
    const { service } = await setup();
    await expect(service.login({ email: 'ana@test.com', password: 'otra' })).rejects.toMatchObject({ status: 401 });
  });
});
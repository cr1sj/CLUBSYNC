import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const document = readFileSync(resolve(process.cwd(), 'docs', 'openapi.yaml'), 'utf8');

describe('Contrato OpenAPI de ClubSync', () => {
  it.each([
    '/api/auth/register:',
    '/api/auth/login:',
    '/api/assignments:',
    '/api/surveys:',
    '/api/surveys/{id}/votes:',
    '/api/surveys/{id}/close:',
    '/api/clubs/{id}/enrollments:',
    '/health:',
  ])('documenta la ruta %s', (path) => {
    expect(document).toContain(path);
  });

  it('documenta los códigos de estado de las reglas de calidad', () => {
    for (const code of ["'201':", "'400':", "'401':", "'403':", "'404':", "'409':"]) {
      expect(document).toContain(code);
    }
  });

  it('declara la autenticación Bearer JWT', () => {
    expect(document).toContain('bearerAuth');
    expect(document).toContain('scheme: bearer');
  });
});
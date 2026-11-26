import { Server } from 'node:http';
import { AddressInfo } from 'node:net';
import jwt from 'jsonwebtoken';
import { Pool } from 'pg';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createApp } from '../src/app';
import { jwtSecret } from '../src/config';

const adminToken = jwt.sign({ id: 1, role: 'admin' }, jwtSecret());
const studentToken = jwt.sign({ id: 2, role: 'estudiante' }, jwtSecret());
const body = { clubId: 2, roomId: 2, dayOfWeek: 3, startHour: 9 };
const servers: Server[] = [];

async function startApi(query = vi.fn()) {
  const server = createApp({ query } as unknown as Pool).listen(0);
  servers.push(server);
  await new Promise<void>((resolve, reject) => {
    server.once('listening', resolve);
    server.once('error', reject);
  });
  return { baseUrl: `http://127.0.0.1:${(server.address() as AddressInfo).port}`, query };
}

const post = (url: string, token: string | undefined, payload: unknown) =>
  fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(payload),
  });

afterEach(async () => {
  await Promise.all(servers.splice(0).map((s) => new Promise<void>((r) => s.close(() => r()))));
});

describe('API HTTP de ClubSync', () => {
  it('QA-02: un estudiante no puede asignar aulas (403) y no se consulta la base', async () => {
    const { baseUrl, query } = await startApi();
    const res = await post(`${baseUrl}/api/assignments`, studentToken, body);
    expect(res.status).toBe(403);
    expect(query).not.toHaveBeenCalled();
  });

  it('QA-02.1: sin token la API responde 401', async () => {
    const { baseUrl, query } = await startApi();
    const res = await post(`${baseUrl}/api/assignments`, undefined, body);
    expect(res.status).toBe(401);
    expect(query).not.toHaveBeenCalled();
  });

  it('CS-01: el administrador crea la asignación y recibe 201', async () => {
    const query = vi.fn().mockResolvedValue({ rows: [{ id: 3, ...body }] });
    const { baseUrl } = await startApi(query);
    const res = await post(`${baseUrl}/api/assignments`, adminToken, body);
    expect(res.status).toBe(201);
    expect(await res.json()).toEqual({ id: 3, ...body });
  });

  it('QA-01: un conflicto de aula en la base se responde como 409', async () => {
    const query = vi.fn().mockRejectedValue(Object.assign(new Error('dup'), { code: '23505' }));
    const { baseUrl } = await startApi(query);
    const res = await post(`${baseUrl}/api/assignments`, adminToken, body);
    const json = (await res.json()) as { error: string };
    expect(res.status).toBe(409);
    expect(json.error).toContain('ocupada');
  });

  it('VAL-01: datos inválidos responden 400 sin consultar la base', async () => {
    const { baseUrl, query } = await startApi();
    const res = await post(`${baseUrl}/api/assignments`, adminToken, { ...body, dayOfWeek: 9 });
    expect(res.status).toBe(400);
    expect(query).not.toHaveBeenCalled();
  });

  it('CS-01.1: lista las asignaciones con 200', async () => {
    const query = vi.fn().mockResolvedValue({ rows: [{ id: 3, ...body }] });
    const { baseUrl } = await startApi(query);
    const res = await fetch(`${baseUrl}/api/assignments`);
    expect(res.status).toBe(200);
    expect(await res.json()).toHaveLength(1);
  });

  it('QA-07: un voto repetido se responde como 409 de punta a punta', async () => {
    const survey = { id: 1, clubId: 2, closesAt: new Date(Date.now() + 3_600_000), status: 'abierta' };
    const query = vi.fn()
      .mockResolvedValueOnce({ rows: [survey] })
      .mockRejectedValueOnce(Object.assign(new Error('dup'), { code: '23505' }));
    const { baseUrl } = await startApi(query);
    const res = await post(`${baseUrl}/api/surveys/1/votes`, studentToken, { optionId: 1 });
    const json = (await res.json()) as { error: string };
    expect(res.status).toBe(409);
    expect(json.error).toContain('Ya votó');
  });

  it('CS-03: un administrador no puede votar (403)', async () => {
    const { baseUrl } = await startApi();
    const res = await post(`${baseUrl}/api/surveys/1/votes`, adminToken, { optionId: 1 });
    expect(res.status).toBe(403);
  });

  it('GET /health responde ok', async () => {
    const { baseUrl } = await startApi();
    const res = await fetch(`${baseUrl}/health`);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ status: 'ok' });
  });
});
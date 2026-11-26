import { Pool } from 'pg';
import { describe, expect, it, vi } from 'vitest';
import { AppError } from '../src/domain/errors';
import { PostgresAssignmentRepository } from '../src/persistence/PostgresAssignmentRepository';

const input = { clubId: 1, roomId: 2, dayOfWeek: 3, startHour: 9 };

function repoWith(query: ReturnType<typeof vi.fn>) {
  return new PostgresAssignmentRepository({ query } as unknown as Pool);
}

describe('PostgresAssignmentRepository', () => {
  it('CS-01: parametriza los valores SQL y devuelve la fila creada', async () => {
    const row = { id: 5, ...input };
    const query = vi.fn().mockResolvedValue({ rows: [row] });
    const result = await repoWith(query).insert(input);
    expect(query).toHaveBeenCalledTimes(1);
    expect(query).toHaveBeenCalledWith(expect.stringContaining('VALUES ($1, $2, $3, $4)'), [1, 2, 3, 9]);
    expect(result).toEqual(row);
  });

  it('QA-01: traduce la violación de unicidad (23505) a un 409', async () => {
    const query = vi.fn().mockRejectedValue(Object.assign(new Error('dup'), { code: '23505' }));
    const promise = repoWith(query).insert(input);
    await expect(promise).rejects.toBeInstanceOf(AppError);
    await expect(promise).rejects.toMatchObject({ status: 409 });
  });

  it('VAL-02: traduce la violación de clave foránea (23503) a un 404', async () => {
    const query = vi.fn().mockRejectedValue(Object.assign(new Error('fk'), { code: '23503' }));
    await expect(repoWith(query).insert(input)).rejects.toMatchObject({ status: 404 });
  });

  it('CS-01.1: lista las asignaciones ordenadas por día y hora', async () => {
    const query = vi.fn().mockResolvedValue({ rows: [{ id: 1, ...input }] });
    const result = await repoWith(query).findAll();
    expect(result).toHaveLength(1);
    expect(query).toHaveBeenCalledWith(expect.stringContaining('ORDER BY day_of_week, start_hour'));
  });
});
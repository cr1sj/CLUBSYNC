import { describe, expect, it, vi } from 'vitest';
import { CreateAssignmentService } from '../src/application/CreateAssignmentService';
import { Assignment, AssignmentRepository, NewAssignment } from '../src/domain/assignment';
import { AppError } from '../src/domain/errors';

const valid = { clubId: 1, roomId: 1, dayOfWeek: 2, startHour: 10 };

function setup(insert = vi.fn(async (a: NewAssignment): Promise<Assignment> => ({ id: 1, ...a }))) {
  const repository: AssignmentRepository = { insert, findAll: vi.fn(async () => []) };
  return { service: new CreateAssignmentService(repository), insert };
}

describe('CS-01 CreateAssignmentService', () => {
  it('CS-01: envía una asignación válida al repositorio y devuelve el resultado', async () => {
    const { service, insert } = setup();
    const result = await service.execute(valid);
    expect(result).toEqual({ id: 1, ...valid });
    expect(insert).toHaveBeenCalledWith(valid);
  });

  it('VAL-01: rechaza campos que no son enteros con 400 y no llama al repositorio', async () => {
    const { service, insert } = setup();
    await expect(service.execute({ ...valid, clubId: 'uno' })).rejects.toMatchObject({ status: 400 });
    expect(insert).not.toHaveBeenCalled();
  });

  it('VAL-01: rechaza dayOfWeek fuera de 1 a 7', async () => {
    const { service, insert } = setup();
    await expect(service.execute({ ...valid, dayOfWeek: 9 })).rejects.toThrow('dayOfWeek debe estar entre 1 y 7.');
    expect(insert).not.toHaveBeenCalled();
  });

  it('VAL-01: rechaza startHour fuera de 7 a 21', async () => {
    const { service, insert } = setup();
    await expect(service.execute({ ...valid, startHour: 25 })).rejects.toThrow('startHour debe estar entre 7 y 21.');
    expect(insert).not.toHaveBeenCalled();
  });

  it('QA-01: propaga el 409 cuando el aula ya está ocupada', async () => {
    const { service } = setup(vi.fn().mockRejectedValue(new AppError(409, 'Aula ocupada')));
    await expect(service.execute(valid)).rejects.toMatchObject({ status: 409 });
  });
});
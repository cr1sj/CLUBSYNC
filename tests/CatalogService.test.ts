import { describe, expect, it, vi } from 'vitest';
import { CatalogService } from '../src/application/CatalogService';
import { CatalogRepository } from '../src/domain/catalog';
import { AppError } from '../src/domain/errors';

function setup(createRoom = vi.fn(async (name: string, capacity: number) => ({ id: 1, name, capacity }))) {
  const repo = {
    createClub: vi.fn(async (name: string, capacity: number) => ({ id: 1, name, capacity })),
    createRoom,
    listClubs: vi.fn(async () => []),
    listRooms: vi.fn(async () => []),
    listSchedule: vi.fn(async () => []),
  } as CatalogRepository;
  return { service: new CatalogService(repo), repo };
}

describe('CS-06 CatalogService (clubes y aulas)', () => {
  it('CS-06: crea un club recortando el nombre', async () => {
    const { service, repo } = setup();
    const club = await service.createClub({ name: '  Club de Ajedrez  ', capacity: 15 });
    expect(club.name).toBe('Club de Ajedrez');
    expect(repo.createClub).toHaveBeenCalledWith('Club de Ajedrez', 15);
  });

  it('VAL-04: rechaza un nombre vacío con 400', async () => {
    const { service, repo } = setup();
    await expect(service.createClub({ name: '   ', capacity: 15 })).rejects.toMatchObject({ status: 400 });
    expect(repo.createClub).not.toHaveBeenCalled();
  });

  it('VAL-04: rechaza una capacidad fuera de rango con 400', async () => {
    const { service } = setup();
    await expect(service.createRoom({ name: 'Aula 1', capacity: 0 })).rejects.toMatchObject({ status: 400 });
  });

  it('CS-06: propaga el 409 cuando el aula ya existe', async () => {
    const { service } = setup(vi.fn().mockRejectedValue(new AppError(409, 'Ya existe un aula con ese nombre.')));
    await expect(service.createRoom({ name: 'Aula 1', capacity: 30 })).rejects.toMatchObject({ status: 409 });
  });
});
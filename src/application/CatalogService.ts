import { CatalogRepository } from '../domain/catalog';
import { AppError } from '../domain/errors';

export class CatalogService {
  constructor(private readonly repo: CatalogRepository) {}

  async createClub(input: unknown) {
    const { name, capacity } = this.parse(input);
    return this.repo.createClub(name, capacity);
  }
  async createRoom(input: unknown) {
    const { name, capacity } = this.parse(input);
    return this.repo.createRoom(name, capacity);
  }
  listClubs() { return this.repo.listClubs(); }
  listRooms() { return this.repo.listRooms(); }
  listSchedule() { return this.repo.listSchedule(); }

  private parse(input: unknown): { name: string; capacity: number } {
    const b = (input ?? {}) as Record<string, unknown>;
    if (typeof b.name !== 'string' || b.name.trim() === '' || b.name.trim().length > 120) {
      throw new AppError(400, 'name es obligatorio (máximo 120 caracteres).');
    }
    const capacity = b.capacity;
    if (!Number.isInteger(capacity) || (capacity as number) < 1 || (capacity as number) > 500) {
      throw new AppError(400, 'capacity debe ser un entero entre 1 y 500.');
    }
    return { name: b.name.trim(), capacity: capacity as number };
  }
  
}


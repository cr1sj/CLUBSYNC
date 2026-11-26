import { Pool } from 'pg';
import { CatalogRepository, Club, Room, ScheduleItem } from '../domain/catalog';
import { AppError } from '../domain/errors';

export class PostgresCatalogRepository implements CatalogRepository {
  constructor(private readonly pool: Pool) {}

  async createClub(name: string, capacity: number): Promise<Club> {
    const r = await this.pool.query(
      'INSERT INTO clubs(name, capacity) VALUES ($1, $2) RETURNING id, name, capacity', [name, capacity]);
    return r.rows[0] as Club;
  }

  async listClubs(): Promise<Club[]> {
    const r = await this.pool.query('SELECT id, name, capacity FROM clubs ORDER BY name');
    return r.rows as Club[];
  }

  async createRoom(name: string, capacity: number): Promise<Room> {
    try {
      const r = await this.pool.query(
        'INSERT INTO rooms(name, capacity) VALUES ($1, $2) RETURNING id, name, capacity', [name, capacity]);
      return r.rows[0] as Room;
    } catch (error) {
      if ((error as { code?: string }).code === '23505') throw new AppError(409, 'Ya existe un aula con ese nombre.');
      throw error;
    }
  }

  async listRooms(): Promise<Room[]> {
    const r = await this.pool.query('SELECT id, name, capacity FROM rooms ORDER BY name');
    return r.rows as Room[];
  }

  async listSchedule(): Promise<ScheduleItem[]> {
    const r = await this.pool.query(
      `SELECT a.id, c.name AS "clubName", r.name AS "roomName",
              a.day_of_week AS "dayOfWeek", a.start_hour AS "startHour"
       FROM assignments a JOIN clubs c ON c.id = a.club_id JOIN rooms r ON r.id = a.room_id
       ORDER BY a.day_of_week, a.start_hour`);
    return r.rows as ScheduleItem[];
  }
}
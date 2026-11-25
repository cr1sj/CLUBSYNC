import { Pool } from 'pg';
import { Assignment, AssignmentRepository, NewAssignment } from '../domain/assignment';
import { AppError } from '../domain/errors';

const COLUMNS = `id, club_id AS "clubId", room_id AS "roomId",
  day_of_week AS "dayOfWeek", start_hour AS "startHour"`;

export class PostgresAssignmentRepository implements AssignmentRepository {
  constructor(private readonly pool: Pool) {}

  async insert(a: NewAssignment): Promise<Assignment> {
    try {
      const result = await this.pool.query(
        `INSERT INTO assignments (club_id, room_id, day_of_week, start_hour)
         VALUES ($1, $2, $3, $4) RETURNING ${COLUMNS}`,
        [a.clubId, a.roomId, a.dayOfWeek, a.startHour],
      );
      return result.rows[0] as Assignment;
    } catch (error) {
      const code = (error as { code?: string }).code;
      if (code === '23505') throw new AppError(409, 'El aula está ocupada en ese horario o el club ya tiene asignación.');
      if (code === '23503') throw new AppError(404, 'El club o el aula no existe.');
      throw error;
    }
  }

  async findAll(): Promise<Assignment[]> {
    const result = await this.pool.query(
      `SELECT ${COLUMNS} FROM assignments ORDER BY day_of_week, start_hour`,
    );
    return result.rows as Assignment[];
  }
}
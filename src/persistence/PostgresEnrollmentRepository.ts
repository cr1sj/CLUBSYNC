import { Pool } from 'pg';
import { ClubInfo, EnrollmentRepository } from '../domain/enrollment';
import { AppError } from '../domain/errors';

export class PostgresEnrollmentRepository implements EnrollmentRepository {
  constructor(private readonly pool: Pool) {}

  async clubInfo(clubId: number): Promise<ClubInfo | undefined> {
    const r = await this.pool.query(
      `SELECT c.capacity,
              (SELECT COUNT(*)::int FROM enrollments e WHERE e.club_id = c.id) AS enrolled,
              EXISTS (SELECT 1 FROM assignments a WHERE a.club_id = c.id) AS "hasSchedule"
       FROM clubs c WHERE c.id = $1`,
      [clubId],
    );
    return r.rows[0] as ClubInfo | undefined;
  }

  async enroll(clubId: number, studentId: number): Promise<void> {
    try {
      await this.pool.query(`INSERT INTO enrollments(club_id, student_id) VALUES ($1,$2)`, [clubId, studentId]);
    } catch (error) {
      const code = (error as { code?: string }).code;
      if (code === '23505') throw new AppError(409, 'Ya está inscrito en este club.');
      if (code === '23503') throw new AppError(404, 'Club o estudiante no existe.');
      throw error;
    }
  }
}
import { Pool } from 'pg';
import { AppError } from '../domain/errors';
import { OptionResult, Survey, SurveyRepository, SurveyWithOptions } from '../domain/survey';

export class PostgresSurveyRepository implements SurveyRepository {
  constructor(private readonly pool: Pool) {}

  async create(clubId: number, closesAt: Date, options: { dayOfWeek: number; startHour: number }[]): Promise<SurveyWithOptions> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const s = await client.query(
        `INSERT INTO surveys(club_id, closes_at) VALUES ($1,$2)
         RETURNING id, club_id AS "clubId", closes_at AS "closesAt", status`,
        [clubId, closesAt],
      );
      const saved = [];
      for (const o of options) {
        const r = await client.query(
          `INSERT INTO survey_options(survey_id, day_of_week, start_hour) VALUES ($1,$2,$3)
           RETURNING id, day_of_week AS "dayOfWeek", start_hour AS "startHour"`,
          [s.rows[0].id, o.dayOfWeek, o.startHour],
        );
        saved.push(r.rows[0]);
      }
      await client.query('COMMIT');
      return { ...s.rows[0], options: saved } as SurveyWithOptions;
    } catch (error) {
      await client.query('ROLLBACK');
      if ((error as { code?: string }).code === '23503') throw new AppError(404, 'El club no existe.');
      throw error;
    } finally {
      client.release();
    }
  }

  async findById(id: number): Promise<Survey | undefined> {
    const r = await this.pool.query(
      `SELECT id, club_id AS "clubId", closes_at AS "closesAt", status FROM surveys WHERE id = $1`, [id]);
    return r.rows[0] as Survey | undefined;
  }

  async addVote(surveyId: number, optionId: number, studentId: number): Promise<void> {
    try {
      const r = await this.pool.query(
        `INSERT INTO votes(survey_id, option_id, student_id)
         SELECT $1, o.id, $3 FROM survey_options o WHERE o.id = $2 AND o.survey_id = $1`,
        [surveyId, optionId, studentId],
      );
      if (r.rowCount === 0) throw new AppError(404, 'La opción no pertenece a esta encuesta.');
    } catch (error) {
      if ((error as { code?: string }).code === '23505') throw new AppError(409, 'Ya votó en esta encuesta.');
      throw error;
    }
  }

  async results(surveyId: number): Promise<OptionResult[]> {
    const r = await this.pool.query(
      `SELECT o.id AS "optionId", o.day_of_week AS "dayOfWeek", o.start_hour AS "startHour",
              COUNT(v.id)::int AS votes
       FROM survey_options o LEFT JOIN votes v ON v.option_id = o.id
       WHERE o.survey_id = $1 GROUP BY o.id ORDER BY votes DESC, o.id`,
      [surveyId],
    );
    return r.rows as OptionResult[];
  }

  async close(surveyId: number): Promise<void> {
    await this.pool.query(`UPDATE surveys SET status = 'cerrada' WHERE id = $1`, [surveyId]);
  }
}
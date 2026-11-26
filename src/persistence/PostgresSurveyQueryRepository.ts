import { Pool } from 'pg';
import { SurveyListItem, SurveyQueryRepository } from '../domain/surveyQuery';

export class PostgresSurveyQueryRepository implements SurveyQueryRepository {
  constructor(private readonly pool: Pool) {}

  async listAll(): Promise<SurveyListItem[]> {
    const r = await this.pool.query(
      `SELECT s.id, s.club_id AS "clubId", c.name AS "clubName",
              s.closes_at AS "closesAt", s.status,
              COALESCE(json_agg(json_build_object(
                'id', o.id, 'dayOfWeek', o.day_of_week, 'startHour', o.start_hour,
                'votes', (SELECT COUNT(*)::int FROM votes v WHERE v.option_id = o.id))
                ORDER BY o.id) FILTER (WHERE o.id IS NOT NULL), '[]') AS options
       FROM surveys s
       JOIN clubs c ON c.id = s.club_id
       LEFT JOIN survey_options o ON o.survey_id = s.id
       GROUP BY s.id, c.name
       ORDER BY s.id DESC`);
    return r.rows as SurveyListItem[];
  }
}
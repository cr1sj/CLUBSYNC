import { AppError } from '../domain/errors';
import { SurveyRepository } from '../domain/survey';

const isInt = (v: unknown): v is number => Number.isInteger(v);

export class CreateSurveyService {
  constructor(private readonly repo: SurveyRepository) {}
  async execute(input: unknown) {
    const b = (input ?? {}) as Record<string, unknown>;
    if (!isInt(b.clubId)) throw new AppError(400, 'clubId debe ser entero.');
    const closesAt = new Date(String(b.closesAt));
    if (Number.isNaN(closesAt.getTime()) || closesAt.getTime() <= Date.now()) {
      throw new AppError(400, 'closesAt debe ser una fecha futura válida.');
    }
    if (!Array.isArray(b.options) || b.options.length < 2) {
      throw new AppError(400, 'Se necesitan al menos 2 opciones de horario.');
    }
    const options = b.options.map((o: any) => {
      if (!isInt(o?.dayOfWeek) || o.dayOfWeek < 1 || o.dayOfWeek > 7 || !isInt(o?.startHour) || o.startHour < 7 || o.startHour > 21) {
        throw new AppError(400, 'Cada opción necesita dayOfWeek (1-7) y startHour (7-21).');
      }
      return { dayOfWeek: o.dayOfWeek as number, startHour: o.startHour as number };
    });
    return this.repo.create(b.clubId, closesAt, options);
  }
}

export class VoteService {
  constructor(private readonly repo: SurveyRepository) {}
  async execute(surveyId: number, input: unknown, studentId: number): Promise<{ message: string }> {
    const b = (input ?? {}) as Record<string, unknown>;
    if (!isInt(surveyId) || !isInt(b.optionId)) throw new AppError(400, 'surveyId y optionId deben ser enteros.');
    const survey = await this.repo.findById(surveyId);
    if (!survey) throw new AppError(404, 'La encuesta no existe.');
    if (survey.status !== 'abierta' || survey.closesAt.getTime() <= Date.now()) {
      throw new AppError(409, 'La encuesta está cerrada.');
    }
    await this.repo.addVote(surveyId, b.optionId, studentId);
    return { message: 'Voto registrado.' };
  }
}

export class CloseSurveyService {
  constructor(private readonly repo: SurveyRepository) {}
  async execute(surveyId: number, input: unknown) {
    if (!isInt(surveyId)) throw new AppError(400, 'surveyId debe ser entero.');
    const survey = await this.repo.findById(surveyId);
    if (!survey) throw new AppError(404, 'La encuesta no existe.');
    if (survey.status === 'cerrada') throw new AppError(409, 'La encuesta ya estaba cerrada.');
    const results = await this.repo.results(surveyId);
    const max = Math.max(...results.map((r) => r.votes));
    const leaders = results.filter((r) => r.votes === max);
    const chosen = ((input ?? {}) as Record<string, unknown>).optionId;
    let winner = leaders[0];
    if (leaders.length > 1) {
      winner = leaders.find((l) => l.optionId === chosen) as (typeof leaders)[number];
      if (!winner) throw new AppError(409, 'Hay empate: envíe optionId con la opción que decide el administrador.');
    }
    await this.repo.close(surveyId);
    return { surveyId, winner, results };
  }
}
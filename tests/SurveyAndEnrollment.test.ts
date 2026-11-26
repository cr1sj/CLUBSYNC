import { describe, expect, it, vi } from 'vitest';
import { EnrollService } from '../src/application/EnrollService';
import { CloseSurveyService, CreateSurveyService, VoteService } from '../src/application/SurveyServices';
import { EnrollmentRepository } from '../src/domain/enrollment';
import { AppError } from '../src/domain/errors';
import { SurveyRepository } from '../src/domain/survey';

const open = { id: 1, clubId: 2, closesAt: new Date(Date.now() + 3_600_000), status: 'abierta' };

function surveyRepo(overrides: Partial<SurveyRepository> = {}): SurveyRepository {
  return {
    create: vi.fn(), findById: vi.fn(async () => open), addVote: vi.fn(async () => undefined),
    results: vi.fn(async () => []), close: vi.fn(async () => undefined), ...overrides,
  } as SurveyRepository;
}

describe('CS-02 CreateSurveyService', () => {
  const body = {
    clubId: 2, closesAt: new Date(Date.now() + 86_400_000).toISOString(),
    options: [{ dayOfWeek: 2, startHour: 10 }, { dayOfWeek: 3, startHour: 15 }],
  };

  it('CS-02: crea la encuesta con sus opciones', async () => {
    const create = vi.fn(async () => ({ ...open, options: [] }));
    await new CreateSurveyService(surveyRepo({ create })).execute(body);
    expect(create).toHaveBeenCalledWith(2, expect.any(Date), body.options);
  });

  it('VAL-03: rechaza una encuesta con menos de 2 opciones', async () => {
    const repo = surveyRepo();
    await expect(new CreateSurveyService(repo).execute({ ...body, options: [body.options[0]] }))
      .rejects.toMatchObject({ status: 400 });
    expect(repo.create).not.toHaveBeenCalled();
  });

  it('VAL-03: rechaza una fecha de cierre en el pasado', async () => {
    await expect(new CreateSurveyService(surveyRepo()).execute({ ...body, closesAt: '2020-01-01T00:00:00Z' }))
      .rejects.toMatchObject({ status: 400 });
  });
});

describe('CS-03 VoteService', () => {
  it('CS-03: registra el voto del estudiante', async () => {
    const repo = surveyRepo();
    const result = await new VoteService(repo).execute(1, { optionId: 5 }, 7);
    expect(result.message).toBe('Voto registrado.');
    expect(repo.addVote).toHaveBeenCalledWith(1, 5, 7);
  });

  it('QA-07: propaga el 409 cuando el estudiante ya votó', async () => {
    const repo = surveyRepo({ addVote: vi.fn().mockRejectedValue(new AppError(409, 'Ya votó')) });
    await expect(new VoteService(repo).execute(1, { optionId: 5 }, 7)).rejects.toMatchObject({ status: 409 });
  });

  it('CS-03.1: rechaza votar en una encuesta cerrada sin tocar el repositorio', async () => {
    const repo = surveyRepo({ findById: vi.fn(async () => ({ ...open, status: 'cerrada' })) });
    await expect(new VoteService(repo).execute(1, { optionId: 5 }, 7)).rejects.toMatchObject({ status: 409 });
    expect(repo.addVote).not.toHaveBeenCalled();
  });

  it('CS-03: responde 404 si la encuesta no existe', async () => {
    const repo = surveyRepo({ findById: vi.fn(async () => undefined) });
    await expect(new VoteService(repo).execute(99, { optionId: 5 }, 7)).rejects.toMatchObject({ status: 404 });
  });
});

describe('CS-04 CloseSurveyService', () => {
  const r = (optionId: number, votes: number) => ({ optionId, dayOfWeek: 2, startHour: 10, votes });

  it('CS-04: cierra la encuesta y devuelve la opción más votada', async () => {
    const repo = surveyRepo({ results: vi.fn(async () => [r(1, 3), r(2, 1)]) });
    const out = await new CloseSurveyService(repo).execute(1, {});
    expect(out.winner.optionId).toBe(1);
    expect(repo.close).toHaveBeenCalledWith(1);
  });

  it('CS-04: en caso de empate sin optionId responde 409 y no cierra', async () => {
    const repo = surveyRepo({ results: vi.fn(async () => [r(1, 2), r(2, 2)]) });
    await expect(new CloseSurveyService(repo).execute(1, {})).rejects.toMatchObject({ status: 409 });
    expect(repo.close).not.toHaveBeenCalled();
  });

  it('CS-04: en caso de empate decide el administrador con optionId', async () => {
    const repo = surveyRepo({ results: vi.fn(async () => [r(1, 2), r(2, 2)]) });
    const out = await new CloseSurveyService(repo).execute(1, { optionId: 2 });
    expect(out.winner.optionId).toBe(2);
  });
});

describe('CS-05 EnrollService', () => {
  function enrollRepo(info: { capacity: number; enrolled: number; hasSchedule: boolean } | undefined) {
    return { clubInfo: vi.fn(async () => info), enroll: vi.fn(async () => undefined) } as EnrollmentRepository;
  }

  it('CS-05: inscribe al estudiante cuando hay horario y cupo', async () => {
    const repo = enrollRepo({ capacity: 20, enrolled: 3, hasSchedule: true });
    const out = await new EnrollService(repo).execute(2, 7);
    expect(out.message).toBe('Inscripción registrada.');
    expect(repo.enroll).toHaveBeenCalledWith(2, 7);
  });

  it('CS-05: rechaza con 409 si el club no tiene cupo', async () => {
    const repo = enrollRepo({ capacity: 2, enrolled: 2, hasSchedule: true });
    await expect(new EnrollService(repo).execute(2, 7)).rejects.toMatchObject({ status: 409 });
    expect(repo.enroll).not.toHaveBeenCalled();
  });

  it('CS-05: rechaza con 409 si el club aún no tiene horario publicado', async () => {
    const repo = enrollRepo({ capacity: 20, enrolled: 0, hasSchedule: false });
    await expect(new EnrollService(repo).execute(2, 7)).rejects.toMatchObject({ status: 409 });
  });

  it('CS-05: responde 404 si el club no existe', async () => {
    await expect(new EnrollService(enrollRepo(undefined)).execute(99, 7)).rejects.toMatchObject({ status: 404 });
  });
});
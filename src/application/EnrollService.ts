import { AppError } from '../domain/errors';
import { EnrollmentRepository } from '../domain/enrollment';

export class EnrollService {
  constructor(private readonly repo: EnrollmentRepository) {}
  async execute(clubId: number, studentId: number): Promise<{ message: string }> {
    if (!Number.isInteger(clubId)) throw new AppError(400, 'clubId debe ser entero.');
    const info = await this.repo.clubInfo(clubId);
    if (!info) throw new AppError(404, 'El club no existe.');
    if (!info.hasSchedule) throw new AppError(409, 'El club aún no tiene horario publicado.');
    if (info.enrolled >= info.capacity) throw new AppError(409, 'El club no tiene cupo disponible.');
    await this.repo.enroll(clubId, studentId);
    return { message: 'Inscripción registrada.' };
  }
}
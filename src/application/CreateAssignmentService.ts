import { Assignment, AssignmentRepository } from '../domain/assignment';
import { AppError } from '../domain/errors';

export class CreateAssignmentService {
  constructor(private readonly repository: AssignmentRepository) {}

  async execute(input: unknown): Promise<Assignment> {
    const body = (input ?? {}) as Record<string, unknown>;
    const { clubId, roomId, dayOfWeek, startHour } = body;

    if (![clubId, roomId, dayOfWeek, startHour].every(Number.isInteger)) {
      throw new AppError(400, 'clubId, roomId, dayOfWeek y startHour deben ser enteros.');
    }
    const day = dayOfWeek as number;
    const hour = startHour as number;
    if (day < 1 || day > 7) throw new AppError(400, 'dayOfWeek debe estar entre 1 y 7.');
    if (hour < 7 || hour > 21) throw new AppError(400, 'startHour debe estar entre 7 y 21.');

    return this.repository.insert({
      clubId: clubId as number,
      roomId: roomId as number,
      dayOfWeek: day,
      startHour: hour,
    });
  }
}
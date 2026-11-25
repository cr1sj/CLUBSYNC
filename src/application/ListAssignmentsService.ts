import { Assignment, AssignmentRepository } from '../domain/assignment';

export class ListAssignmentsService {
  constructor(private readonly repository: AssignmentRepository) {}

  execute(): Promise<Assignment[]> {
    return this.repository.findAll();
  }
}
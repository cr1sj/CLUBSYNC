export interface NewAssignment {
  clubId: number;
  roomId: number;
  dayOfWeek: number;
  startHour: number;
}

export interface Assignment extends NewAssignment {
  id: number;
}

export interface AssignmentRepository {
  insert(assignment: NewAssignment): Promise<Assignment>;
  findAll(): Promise<Assignment[]>;
}
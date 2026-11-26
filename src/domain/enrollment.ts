export interface ClubInfo { capacity: number; enrolled: number; hasSchedule: boolean; }

export interface EnrollmentRepository {
  clubInfo(clubId: number): Promise<ClubInfo | undefined>;
  enroll(clubId: number, studentId: number): Promise<void>;
}
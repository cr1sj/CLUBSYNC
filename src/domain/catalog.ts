export interface Club { id: number; name: string; capacity: number; }
export interface Room { id: number; name: string; capacity: number; }
export interface ScheduleItem {
  id: number; clubName: string; roomName: string; dayOfWeek: number; startHour: number;
}

export interface CatalogRepository {
  createClub(name: string, capacity: number): Promise<Club>;
  listClubs(): Promise<Club[]>;
  createRoom(name: string, capacity: number): Promise<Room>;
  listRooms(): Promise<Room[]>;
  listSchedule(): Promise<ScheduleItem[]>;
}
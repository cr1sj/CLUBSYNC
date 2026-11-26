export interface SurveyListOption { id: number; dayOfWeek: number; startHour: number; votes: number; }
export interface SurveyListItem {
  id: number; clubId: number; clubName: string; closesAt: Date; status: string;
  options: SurveyListOption[];
}
export interface SurveyQueryRepository { listAll(): Promise<SurveyListItem[]>; }
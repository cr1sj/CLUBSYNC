export interface SurveyOption { id: number; dayOfWeek: number; startHour: number; }
export interface Survey { id: number; clubId: number; closesAt: Date; status: string; }
export interface SurveyWithOptions extends Survey { options: SurveyOption[]; }
export interface OptionResult { optionId: number; dayOfWeek: number; startHour: number; votes: number; }

export interface SurveyRepository {
  create(clubId: number, closesAt: Date, options: { dayOfWeek: number; startHour: number }[]): Promise<SurveyWithOptions>;
  findById(id: number): Promise<Survey | undefined>;
  addVote(surveyId: number, optionId: number, studentId: number): Promise<void>;
  results(surveyId: number): Promise<OptionResult[]>;
  close(surveyId: number): Promise<void>;
}
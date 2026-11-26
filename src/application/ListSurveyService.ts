import { SurveyListItem, SurveyQueryRepository } from '../domain/surveyQuery';

export class ListSurveysService {
  constructor(private readonly repo: SurveyQueryRepository) {}
  execute(): Promise<SurveyListItem[]> { return this.repo.listAll(); }
}
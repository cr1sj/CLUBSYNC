import { Request, Response } from 'express';
import { CloseSurveyService, CreateSurveyService, VoteService } from '../application/SurveyServices';
import { AuthedRequest } from './auth';

export class SurveyController {
  constructor(
    private readonly createService: CreateSurveyService,
    private readonly voteService: VoteService,
    private readonly closeService: CloseSurveyService,
  ) {}
  create = async (request: Request, response: Response) => {
    response.status(201).json(await this.createService.execute(request.body));
  };
  vote = async (request: Request, response: Response) => {
    const studentId = (request as AuthedRequest).user!.id;
    response.status(201).json(await this.voteService.execute(Number(request.params.id), request.body, studentId));
  };
  close = async (request: Request, response: Response) => {
    response.status(200).json(await this.closeService.execute(Number(request.params.id), request.body));
  };
}
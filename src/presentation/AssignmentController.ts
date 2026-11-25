import { NextFunction, Request, Response } from 'express';
import { CreateAssignmentService } from '../application/CreateAssignmentService';
import { ListAssignmentsService } from '../application/ListAssignmentsService';

export class AssignmentController {
  constructor(
    private readonly createService: CreateAssignmentService,
    private readonly listService: ListAssignmentsService,
  ) {}

  create = async (request: Request, response: Response, next: NextFunction) => {
    try {
      response.status(201).json(await this.createService.execute(request.body));
    } catch (error) {
      next(error);
    }
  };

  list = async (_request: Request, response: Response, next: NextFunction) => {
    try {
      response.status(200).json(await this.listService.execute());
    } catch (error) {
      next(error);
    }
  };
}
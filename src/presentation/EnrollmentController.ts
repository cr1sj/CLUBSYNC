import { Request, Response } from 'express';
import { EnrollService } from '../application/EnrollService';
import { AuthedRequest } from './auth';

export class EnrollmentController {
  constructor(private readonly service: EnrollService) {}
  enroll = async (request: Request, response: Response) => {
    const studentId = (request as AuthedRequest).user!.id;
    response.status(201).json(await this.service.execute(Number(request.params.id), studentId));
  };
}
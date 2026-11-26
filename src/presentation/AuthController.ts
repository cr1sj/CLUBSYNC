import { Request, Response } from 'express';
import { AuthService } from '../application/AuthService';

export class AuthController {
  constructor(private readonly service: AuthService) {}
  register = async (request: Request, response: Response) => {
    response.status(201).json(await this.service.register(request.body));
  };
  login = async (request: Request, response: Response) => {
    response.status(200).json(await this.service.login(request.body));
  };
}
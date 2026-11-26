import { Request, Response } from 'express';
import { CatalogService } from '../application/CatalogService';
import { ListSurveysService } from '../application/ListSurveyService';

export class CatalogController {
  constructor(private readonly catalog: CatalogService, private readonly surveys: ListSurveysService) {}
  createClub = async (request: Request, response: Response) => {
    response.status(201).json(await this.catalog.createClub(request.body));
  };
  listClubs = async (_request: Request, response: Response) => {
    response.status(200).json(await this.catalog.listClubs());
  };
  createRoom = async (request: Request, response: Response) => {
    response.status(201).json(await this.catalog.createRoom(request.body));
  };
  listRooms = async (_request: Request, response: Response) => {
    response.status(200).json(await this.catalog.listRooms());
  };
  listSchedule = async (_request: Request, response: Response) => {
    response.status(200).json(await this.catalog.listSchedule());
  };
  listSurveys = async (_request: Request, response: Response) => {
    response.status(200).json(await this.surveys.execute());
  };
}
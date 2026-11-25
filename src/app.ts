import express, { ErrorRequestHandler } from 'express';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { Pool } from 'pg';
import { CreateAssignmentService } from './application/CreateAssignmentService';
import { ListAssignmentsService } from './application/ListAssignmentsService';
import { AppError } from './domain/errors';
import { PostgresAssignmentRepository } from './persistence/PostgresAssignmentRepository';
import { AssignmentController } from './presentation/AssignmentController';
import { createAssignmentRoutes } from './presentation/AssignmentRoutes';

export function createApp(pool: Pool) {
  const app = express();
  const repository = new PostgresAssignmentRepository(pool);
  const createService = new CreateAssignmentService(repository);
  const listService = new ListAssignmentsService(repository);
  const controller = new AssignmentController(createService, listService);

  app.use(express.json());
  app.get('/health', (_request, response) => response.status(200).json({ status: 'ok' }));
  app.get('/openapi.yaml', (_request, response, next) => {
    try {
      const document = readFileSync(resolve(process.cwd(), 'docs', 'openapi.yaml'), 'utf8');
      response.type('application/yaml').send(document);
    } catch (error) {
      next(error);
    }
  });
  app.use('/api', createAssignmentRoutes(controller));

  const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
    if (error instanceof AppError) {
      response.status(error.status).json({ error: error.message });
      return;
    }
    console.error('Error no controlado en la solicitud:', error);
    response.status(500).json({ error: 'Ocurrió un error interno.' });
  };
  app.use(errorHandler);

  return app;
}
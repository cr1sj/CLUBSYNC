import express, { ErrorRequestHandler } from 'express';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { Pool } from 'pg';
import { AuthService } from './application/AuthService';
import { CatalogService } from './application/CatalogService';
import { CreateAssignmentService } from './application/CreateAssignmentService';
import { EnrollService } from './application/EnrollService';
import { ListAssignmentsService } from './application/ListAssignmentsService';
import { ListSurveysService } from './application/ListSurveyService';
import { CloseSurveyService, CreateSurveyService, VoteService } from './application/SurveyServices';
import { AppError } from './domain/errors';
import { PostgresAssignmentRepository } from './persistence/PostgresAssignmentRepository';
import { PostgresCatalogRepository } from './persistence/PostgresCatalogRepository';
import { PostgresEnrollmentRepository } from './persistence/PostgresEnrollmentRepository';
import { PostgresSurveyQueryRepository } from './persistence/PostgresSurveyQueryRepository';
import { PostgresSurveyRepository } from './persistence/PostgresSurveyRepository';
import { PostgresUserRepository } from './persistence/PostgresUserRepository';
import { AssignmentController } from './presentation/AssignmentController';
import { createAssignmentRoutes } from './presentation/assignmentRoutes';
import { AuthController } from './presentation/AuthController';
import { createAuthRoutes } from './presentation/authRoutes';
import { CatalogController } from './presentation/CatalogController';
import { createCatalogRoutes } from './presentation/catalogRoutes';
import { EnrollmentController } from './presentation/EnrollmentController';
import { createEnrollmentRoutes } from './presentation/enrollmentRoutes';
import { SurveyController } from './presentation/SurveyController';
import { createSurveyRoutes } from './presentation/surveyRoutes';

export function createApp(pool: Pool) {
  const app = express();

  const assignmentRepository = new PostgresAssignmentRepository(pool);
  const assignmentController = new AssignmentController(
    new CreateAssignmentService(assignmentRepository),
    new ListAssignmentsService(assignmentRepository),
  );
  const authController = new AuthController(new AuthService(new PostgresUserRepository(pool)));
  const surveyRepository = new PostgresSurveyRepository(pool);
  const surveyController = new SurveyController(
    new CreateSurveyService(surveyRepository),
    new VoteService(surveyRepository),
    new CloseSurveyService(surveyRepository),
  );
  const enrollmentController = new EnrollmentController(
    new EnrollService(new PostgresEnrollmentRepository(pool)),
  );
  const catalogController = new CatalogController(
    new CatalogService(new PostgresCatalogRepository(pool)),
    new ListSurveysService(new PostgresSurveyQueryRepository(pool)),
  );

  app.use(express.json());
  app.use(express.static(resolve(process.cwd(), 'public')));

  app.get('/health', (_request, response) => response.status(200).json({ status: 'ok' }));
  app.get('/openapi.yaml', (_request, response, next) => {
    try {
      const document = readFileSync(resolve(process.cwd(), 'docs', 'openapi.yaml'), 'utf8');
      response.type('application/yaml').send(document);
    } catch (error) {
      next(error);
    }
  });

  app.use('/api', createAuthRoutes(authController));
  app.use('/api', createAssignmentRoutes(assignmentController));
  app.use('/api', createSurveyRoutes(surveyController));
  app.use('/api', createEnrollmentRoutes(enrollmentController));
  app.use('/api', createCatalogRoutes(catalogController));

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
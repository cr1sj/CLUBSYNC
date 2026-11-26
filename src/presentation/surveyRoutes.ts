import { Router } from 'express';
import { requireRole } from './auth';
import { handle } from './handle';
import { SurveyController } from './SurveyController';

export function createSurveyRoutes(c: SurveyController): Router {
  const router = Router();
  router.post('/surveys', requireRole('admin'), handle(c.create));
  router.post('/surveys/:id/votes', requireRole('estudiante'), handle(c.vote));
  router.post('/surveys/:id/close', requireRole('admin'), handle(c.close));
  return router;
}
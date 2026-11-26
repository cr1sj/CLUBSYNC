import { Router } from 'express';
import { AssignmentController } from './AssignmentController';
import { requireRole } from './auth';

export function createAssignmentRoutes(controller: AssignmentController): Router {
  const router = Router();
  router.post('/assignments', requireRole('admin'), controller.create);
  router.get('/assignments', controller.list);
  return router;
}
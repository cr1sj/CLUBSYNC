import { Router } from 'express';
import { AssignmentController } from './AssignmentController';

export function createAssignmentRoutes(controller: AssignmentController): Router {
  const router = Router();
  router.post('/assignments', controller.create);
  router.get('/assignments', controller.list);
  return router;
}
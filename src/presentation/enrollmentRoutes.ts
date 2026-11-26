import { Router } from 'express';
import { requireRole } from './auth';
import { EnrollmentController } from './EnrollmentController';
import { handle } from './handle';

export function createEnrollmentRoutes(c: EnrollmentController): Router {
  const router = Router();
  router.post('/clubs/:id/enrollments', requireRole('estudiante'), handle(c.enroll));
  return router;
}
import { Router } from 'express';
import { AuthController } from './AuthController';
import { handle } from './handle';

export function createAuthRoutes(controller: AuthController): Router {
  const router = Router();
  router.post('/auth/register', handle(controller.register));
  router.post('/auth/login', handle(controller.login));
  return router;
}
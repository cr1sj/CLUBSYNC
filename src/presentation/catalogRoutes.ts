import { Router } from 'express';
import { requireRole } from './auth';
import { CatalogController } from './CatalogController';
import { handle } from './handle';

export function createCatalogRoutes(c: CatalogController): Router {
  const router = Router();
  router.get('/clubs', handle(c.listClubs));
  router.post('/clubs', requireRole('admin'), handle(c.createClub));
  router.get('/rooms', handle(c.listRooms));
  router.post('/rooms', requireRole('admin'), handle(c.createRoom));
  router.get('/schedule', handle(c.listSchedule));
  router.get('/surveys', handle(c.listSurveys));
  return router;
}
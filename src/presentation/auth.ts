import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { jwtSecret } from '../config';
import { Role } from '../domain/user';

export interface AuthedRequest extends Request {
  user?: { id: number; role: Role };
}

export const requireRole =
  (role: Role) => (request: Request, response: Response, next: NextFunction) => {
    const header = request.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      response.status(401).json({ error: 'No autenticado.' });
      return;
    }
    try {
      const payload = jwt.verify(header.slice(7), jwtSecret()) as { id: number; role: Role };
      if (payload.role !== role) {
        response.status(403).json({ error: 'No tiene permiso para esta operación.' });
        return;
      }
      (request as AuthedRequest).user = { id: payload.id, role: payload.role };
      next();
    } catch {
      response.status(401).json({ error: 'Token inválido o vencido.' });
    }
  };
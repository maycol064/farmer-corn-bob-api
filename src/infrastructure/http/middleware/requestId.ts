import { v4 as uuid } from 'uuid';
import type { Request, Response, NextFunction } from 'express';

export function requestId(req: Request, res: Response, next: NextFunction) {
  const id = req.header('X-Request-Id') || uuid();
  req.requestId = id;
  res.setHeader('X-Request-Id', id);
  next();
}

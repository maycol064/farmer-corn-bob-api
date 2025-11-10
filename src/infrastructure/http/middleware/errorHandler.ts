import type { NextFunction, Request, Response } from 'express';
import { logger } from '../../../config/pino.js';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  const status = err.status || 500;
  const msg = err.message || 'Internal Server Error';
  logger.error({ err, requestId: req.requestId }, msg);
  res.status(status).json({ error: msg, requestId: req.requestId });
}

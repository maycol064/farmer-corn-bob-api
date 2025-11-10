import type { Request, Response, NextFunction } from 'express';
import type { Redis } from 'ioredis';
import { redis } from '../../redis/client.js';

export const attachRedis =
  (client: Redis = redis) =>
  (req: Request, _res: Response, next: NextFunction) => {
    req.redis = client; // <<— Redis disponible en el request
    next();
  };

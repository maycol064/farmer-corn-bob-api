import type { Request, Response, NextFunction } from 'express';
import { SlidingWindowLimiter } from '../../redis/limiter/SlidingWindowLimiter.js';
const WINDOW_MS = 60_000;
const LIMIT = 1;

// Nota: tomamos userId del JWT; si no hay (p.ej. pruebas sin login), caemos al IP.
function clientId(req: Request) {
  return req.user?.id ?? `ip:${req.ip}`;
}

export function rateLimitCorn() {
  return async (req: Request, res: Response, next: NextFunction) => {
    const id = clientId(req);
    const limiter = new SlidingWindowLimiter(req.redis, WINDOW_MS, LIMIT);
    const result = await limiter.isAllowed(id);

    res.setHeader('X-RateLimit-Limit', LIMIT.toString());
    res.setHeader('X-RateLimit-Remaining', result.remaining.toString());
    // epoch seconds para reset/next
    const resetEpoch = Math.ceil((Date.now() + result.resetAfterMs) / 1000);
    res.setHeader('X-RateLimit-Reset', resetEpoch.toString());

    if (!result.allowed) {
      const retrySeconds = Math.ceil(result.retryAfterMs / 1000);
      res.setHeader('Retry-After', retrySeconds.toString());
      return res.status(429).json({
        error: 'Too Many Requests',
        message: `Only can buy 1 corn every 60s. Retry in ~${retrySeconds}s.`,
      });
    }

    return next();
  };
}

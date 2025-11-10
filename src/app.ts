import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { pinoHttp } from 'pino-http';
import { env } from './config/env.js';
import { logger } from './config/pino.js';
import { requestId } from './infrastructure/http/middleware/requestId.js';
import { attachRedis } from './infrastructure/http/middleware/attachReddis.js';
import { errorHandler } from './infrastructure/http/middleware/errorHandler.js';
import { authRoutes } from './infrastructure/http/routes/authRoutes.js';
import { cornRoutes } from './infrastructure/http/routes/cornRoutes.js';

export function buildApp() {
  const app = express();

  app.use(requestId);
  app.use(pinoHttp({ logger }));
  app.use(helmet());
  app.use(
    cors({
      origin: env.corsOrigin,
      credentials: true,
      exposedHeaders: [
        'Retry-After',
        'X-RateLimit-Limit',
        'X-RateLimit-Remaining',
        'X-RateLimit-Reset',
      ],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );
  app.use(express.json());
  app.use(attachRedis());

  app.get('/healthz', (_req, res) => res.status(200).json({ ok: true }));

  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/corn', cornRoutes);

  app.use(errorHandler);
  return app;
}

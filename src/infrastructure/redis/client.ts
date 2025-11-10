import Redis from 'ioredis';
import { env } from '../../config/env.js';
import { logger } from '../../config/pino.js';

export const redis = new Redis(env.redisUrl);

redis.on('connect', () => logger.info('Redis connected'));
redis.on('error', (err: any) => logger.error({ err }, 'Redis error'));

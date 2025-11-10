import 'dotenv/config';

export const env = {
  port: Number(process.env.PORT || 3000),
  nodeEnv: process.env.NODE_ENV || 'development',
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'dev-access',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES || '7d',
  },
};

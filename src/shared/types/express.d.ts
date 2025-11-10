import type { Redis } from 'ioredis';

declare global {
  namespace Express {
    interface UserClaims {
      id: string;
      email: string;
    }
    interface Request {
      redis: Redis;
      user?: UserClaims;
      requestId?: string;
    }
  }
}
export {};

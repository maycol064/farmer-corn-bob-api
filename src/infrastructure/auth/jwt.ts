import jwt from 'jsonwebtoken';
import ms from 'ms';
import { v4 as uuid } from 'uuid';
import type { Redis } from 'ioredis';
import { env } from '../../config/env.js';

export type AccessTokenPayload = { sub: string; email: string; typ: 'access' };
export type RefreshTokenPayload = { sub: string; jti: string; typ: 'refresh' };

export function signAccessToken(user: { id: string; email: string }) {
  const payload: AccessTokenPayload = {
    sub: user.id,
    email: user.email,
    typ: 'access',
  };
  return jwt.sign(payload, env.jwt.accessSecret, {
    expiresIn: env.jwt.accessExpiresIn as ms.StringValue,
  });
}

export async function signRefreshToken(redis: Redis, userId: string) {
  const jti = uuid();
  const payload: RefreshTokenPayload = { sub: userId, jti, typ: 'refresh' };
  const token = jwt.sign(payload, env.jwt.refreshSecret, {
    expiresIn: env.jwt.refreshExpiresIn as ms.StringValue,
  });

  const ttlSeconds = 7 * 24 * 3600;
  await redis.set(`refresh:${jti}`, userId, 'EX', ttlSeconds);

  return { token, jti };
}

export function verifyAccess(token: string) {
  const decoded = jwt.verify(token, env.jwt.accessSecret) as AccessTokenPayload;
  if (decoded.typ !== 'access') throw new Error('Invalid token type');
  return decoded;
}

export async function verifyRefresh(redis: Redis, token: string) {
  const decoded = jwt.verify(
    token,
    env.jwt.refreshSecret
  ) as RefreshTokenPayload;
  if (decoded.typ !== 'refresh') throw new Error('Invalid token type');
  const exists = await redis.get(`refresh:${decoded.jti}`);
  if (!exists) throw new Error('Refresh token revoked or expired');
  return decoded;
}

export async function revokeRefresh(redis: Redis, jti: string) {
  await redis.del(`refresh:${jti}`);
}

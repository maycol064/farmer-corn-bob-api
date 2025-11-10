import type { Redis } from 'ioredis';
import {
  revokeRefresh,
  signAccessToken,
  signRefreshToken,
  verifyRefresh,
} from '../../infrastructure/auth/jwt.js';
import type { UserRepository } from '../../infrastructure/persistence/UserRepository.js';

export class RefreshTokenUseCase {
  constructor(private users: UserRepository, private redis: Redis) {}

  async execute(input: { refreshToken: string }) {
    const decoded = await verifyRefresh(this.redis, input.refreshToken);
    const user = await this.users.findById(decoded.sub);

    if (!user) {
      await revokeRefresh(this.redis, decoded.jti);
      throw Object.assign(new Error('Invalid refresh token'), { status: 401 });
    }

    await revokeRefresh(this.redis, decoded.jti);

    const accessToken = signAccessToken({ id: user.id, email: user.email });
    const { token: newRefreshToken, jti } = await signRefreshToken(
      this.redis,
      user.id
    );

    return { accessToken, refreshToken: newRefreshToken, refreshJti: jti };
  }
}

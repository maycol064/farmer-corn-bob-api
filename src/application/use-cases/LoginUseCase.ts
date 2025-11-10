import bcrypt from 'bcryptjs';
import type { UserRepository } from '../../infrastructure/persistence/UserRepository.js';
import type { Redis } from 'ioredis';
import {
  signAccessToken,
  signRefreshToken,
} from '../../infrastructure/auth/jwt.js';

export class LoginUseCase {
  constructor(private users: UserRepository, private redis: Redis) {}

  async execute(input: { email: string; password: string }) {
    const user = await this.users.findByEmail(input.email);
    if (!user)
      throw Object.assign(new Error('Invalid credentials'), { status: 401 });
    const ok = await bcrypt.compare(input.password, user.passwordHash);
    if (!ok)
      throw Object.assign(new Error('Invalid credentials'), { status: 401 });

    const accessToken = signAccessToken({ id: user.id, email: user.email });
    const { token: refreshToken, jti } = await signRefreshToken(
      this.redis,
      user.id
    );

    return {
      user: { id: user.id, email: user.email, name: user.name },
      tokens: { accessToken, refreshToken, refreshJti: jti },
    };
  }
}

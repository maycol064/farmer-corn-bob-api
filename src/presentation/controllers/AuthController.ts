import type { Request, Response } from 'express';
import { z } from 'zod';
import { RegisterUserUseCase } from '../../application/use-cases/RegisterUserUseCase.js';
import { LoginUseCase } from '../../application/use-cases/LoginUseCase.js';
import { RefreshTokenUseCase } from '../../application/use-cases/RefreshTokenUseCase.js';
import { RedisUserRepository } from '../../infrastructure/persistence/RedisUserRepository.js';
import { redis as redisClient } from '../../infrastructure/redis/client.js';

export class AuthController {
  constructor(private users = new RedisUserRepository(redisClient)) {}

  register = async (req: Request, res: Response) => {
    const data = z
      .object({
        email: z.string().email(),
        name: z.string().min(1),
        password: z.string().min(8),
      })
      .parse(req.body);
    const uc = new RegisterUserUseCase(this.users);
    const out = await uc.execute(data);
    res.status(201).json(out);
  };

  login = async (req: Request, res: Response) => {
    const data = z
      .object({
        email: z.string().email(),
        password: z.string().min(8),
      })
      .parse(req.body);
    const uc = new LoginUseCase(this.users, req.redis);
    const out = await uc.execute(data);
    res.status(200).json(out);
  };

  refresh = async (req: Request, res: Response) => {
    const token = z
      .object({ refreshToken: z.string() })
      .parse(req.body).refreshToken;
    const uc = new RefreshTokenUseCase(this.users, req.redis);
    const out = await uc.execute({ refreshToken: token });
    res.status(200).json(out);
  };

  logout = async (req: Request, res: Response) => {
    const jti = z.object({ jti: z.string().uuid() }).parse(req.body).jti;
    await req.redis.del(`refresh:${jti}`);
    res.status(204).send();
  };
}

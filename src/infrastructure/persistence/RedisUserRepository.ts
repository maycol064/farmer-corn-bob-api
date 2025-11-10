import type { Redis } from 'ioredis';
import { v4 as uuid } from 'uuid';
import type { User, UserRepository } from './UserRepository.js';

export class RedisUserRepository implements UserRepository {
  constructor(private redis: Redis) {}

  private emailKey(email: string) {
    return `user:email:${email.toLowerCase()}`;
  }
  private idKey(id: string) {
    return `user:byId:${id}`;
  }

  async findByEmail(email: string): Promise<User | null> {
    const id = await this.redis.get(this.emailKey(email));
    if (!id) return null;
    const json = await this.redis.get(this.idKey(id));
    return json ? (JSON.parse(json) as User) : null;
  }

  async findById(id: string): Promise<User | null> {
    const json = await this.redis.get(this.idKey(id));
    return json ? (JSON.parse(json) as User) : null;
  }

  async create(user: Omit<User, 'id'>): Promise<User> {
    const id = uuid();
    const keyEmail = this.emailKey(user.email);
    const keyId = this.idKey(id);

    // Reservar el email (best-effort atómico con NX)
    const ok = await this.redis.set(keyEmail, id, 'NX'); // no TTL: persistente
    if (ok !== 'OK') {
      // otro usuario ya reservó ese email
      const err = new Error('Email already in use') as any;
      err.status = 409;
      throw err;
    }

    // Guardar el usuario
    const entity: User = { id, ...user };
    await this.redis.set(keyId, JSON.stringify(entity));

    return entity;
  }
}

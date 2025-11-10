import bcrypt from 'bcryptjs';
import type { UserRepository } from '../../infrastructure/persistence/UserRepository.js';

export class RegisterUserUseCase {
  constructor(private users: UserRepository) {}

  async execute(input: { email: string; name: string; password: string }) {
    const exists = await this.users.findByEmail(input.email);
    if (exists)
      throw Object.assign(new Error('Email already in use'), { status: 409 });
    const passwordHash = await bcrypt.hash(input.password, 10);
    const user = await this.users.create({
      email: input.email,
      name: input.name,
      passwordHash,
    });
    return { id: user.id, email: user.email, name: user.name };
  }
}

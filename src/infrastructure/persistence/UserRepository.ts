export type User = {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
};

export interface UserRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  create(user: Omit<User, 'id'>): Promise<User>;
}

import { Database } from 'sqlite3';
import { User } from '../entities/User.js';
import { ARepository } from './ARepository.js';

export class UserRepository extends ARepository<User> {
  constructor(db: Database) {
    super(db, 'user');
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.find('email=?', email);
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.find('username=?', username);
  }
}
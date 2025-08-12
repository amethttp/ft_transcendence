import { Database } from 'sqlite3';
import { User } from '../entities/user_entity.js';
import { BaseRepository } from './base/base_repository.js';

export class UserRepository extends BaseRepository<User> {
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
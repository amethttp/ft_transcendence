import { User } from "../../../domain/entities/User";
import { SQLiteBaseRepository } from "./SQLiteBaseRepository";
import {IUserRepository} from "../../../domain/repositories/IUserRepository"

export class SQLiteUserRepository implements IUserRepository {
  private repository: SQLiteBaseRepository<User>;

  constructor() {
    this.repository = new SQLiteBaseRepository<User>(User.tableName, User.entitySchema);
  }

  async findById(id: number): Promise<User | null> {
    return this.repository.findById(id);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.repository.findByCondition("email", email);
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.repository.findByCondition("username", username);
  }

  async findAll(): Promise<User[] | null> {
    return this.repository.findAll();
  }

  async create(data: Partial<User>): Promise<User | null> {
    return this.repository.create(data);
  }

  async update(id: number, data: Partial<User>): Promise<User | null> {
    return this.repository.update(id, data);
  }

  async delete(id: number): Promise<boolean> {
    return this.repository.delete(id);
  }
}

import { User } from "../../../domain/entities/User";
import { ARepository } from "./ARepository";
import {IUserRepository} from "../../../domain/repositories/IUserRepository"

export class UserRepository extends ARepository<User> implements IUserRepository {
  constructor() {
    super(User.tableName, User.entitySchema);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.findByCondition("email", email);
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.findByCondition("username", username);
  }
}

import { User } from "../../../domain/entities/User";
import { SQLiteBaseRepository } from "./SQLiteBaseRepository";
import { IUserRepository } from "../../../domain/repositories/IUserRepository"

export class SQLiteUserRepository extends SQLiteBaseRepository<User> implements IUserRepository {

  constructor() {
    super(new User());
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.findByCondition("email", email);
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.findByCondition("username", username);
  }

  async findAllByUsername(username: string): Promise<User[] | null> {
    username = username.replace(/\\/g, '\\\\')
      .replace(/%/g, '\\%')
      .replace(/_/g, '\\_');
    return this.baseFindAll("WHERE username LIKE ? ESCAPE '\\' AND username NOT LIKE '__deleted__%'", [`${username}%`]);
  }
}

import { User } from "../entities/User";
import { ARepository } from "./ARepository";

export class UserRepository extends ARepository<User> {
  constructor() {
    super(User.tableName);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.findByCondition("email", email);
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.findByCondition("username", username);
  }
}

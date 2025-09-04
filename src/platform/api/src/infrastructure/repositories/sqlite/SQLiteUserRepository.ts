import { User } from "../../../domain/entities/User";
import { SQLiteBaseRepository } from "./SQLiteBaseRepository";
import { IUserRepository } from "../../../domain/repositories/IUserRepository"

export class SQLiteUserRepository extends SQLiteBaseRepository<User> implements IUserRepository {

  constructor() {
    super(User.tableName, User.entitySchema);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.findByCondition("email", email);
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.findByCondition("username", username);
  }

  async findByIdPH(userId: number, auth: boolean): Promise<User | null> {
    let sql = `SELECT user.* FROM user WHERE user.id = ?`;
    if (auth) {
      sql = `
        SELECT user.*, auth.*, password.* 
        FROM user 
        JOIN auth ON user.auth_id = auth.id 
        LEFT JOIN password ON auth.password_id = password.id 
        WHERE user.id = ?
      `;
    }
    const user = this.dbGet(sql, [userId]);

    return user;
  }
}

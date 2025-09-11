import { User } from "../../../domain/entities/User";
import { SQLiteBaseRepository } from "./SQLiteBaseRepository";
import { IUserRepository } from "../../../domain/repositories/IUserRepository"
import { AEntity } from "../../../domain/entities/AEntity";

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

  private isValidObj(value: any): boolean {
    if (typeof value === "object" && value !== null && value instanceof AEntity) {
      return true;
    }

    return false;
  }

  private mapObject(entries: [string, any][], tableName: string, schema: Record<string, string>): string {
    let result = "";
    for (const [key, value] of entries) {
      if (key in schema) {
        result += "\'" + key.toString() + "\',";
        if (typeof value === "object" && this.isValidObj(value)) {
          result += "json_object(" + this.mapObject(Object.entries(value), value.tableName, value.schema) + "),";
        } else {
          result += tableName + "." + schema[key] + ",";
        }
      }
    }
    if (result[result.length - 1] === ",") {
      result = result.slice(0, -1);
    }

    return result;
  }

  private mapEntityQuery(): string {
    const user = new User();
    const entries = Object.entries(user);
    const res = this.mapObject(entries, user.tableName, user.schema);

    let sqlRes = `
      SELECT
        json_object(
        ${res}
        ) as result
    `;

    return sqlRes;
  }

  async findByIdPH(userId: number, auth: boolean): Promise<User | null> {
    let sql = `SELECT user.* FROM user WHERE user.id = ?`;
    if (auth) { // TODO: map ourselves prefixed row...
      sql = this.mapEntityQuery() + `
        FROM user 
        JOIN auth ON user.auth_id = auth.id 
        LEFT JOIN password ON auth.password_id = password.id 
        WHERE user.id = ?
      `;
    }
    const user = await this.dbGetTest(sql, [userId]);
    if (user === null)
        throw "failed";

    console.log(user);
    console.log(user.auth.password?.hash);

    return user;
  }
}

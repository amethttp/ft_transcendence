import { UserStatus } from "../../../domain/entities/UserStatus";
import { IUserStatusRepository } from "../../../domain/repositories/IUserStatusRepository";
import { SQLiteBaseRepository } from "./SQLiteBaseRepository";

const POLLING_TIME = 21;

export class SQLiteUserStatusRepository extends SQLiteBaseRepository<UserStatus> implements IUserStatusRepository {

  constructor() {
    super(new UserStatus());
  }

  findByUserId(id: number): Promise<UserStatus | null> {
    const query = `WHERE user_id=? AND (strftime('%s','now') - strftime('%s', ${UserStatus.tableName}.update_time)) < ?`;
    return this.baseFind(query, [id, POLLING_TIME]);
  }
}

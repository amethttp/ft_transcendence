import { SQLiteBaseRepository } from "./SQLiteBaseRepository";
import { UserVerification } from "../../../domain/entities/UserVerification";
import { IUserVerificationRepository } from "../../../domain/repositories/IUserVerificationRepository";

export class SQLiteUserVerificationRepository extends SQLiteBaseRepository<UserVerification> implements IUserVerificationRepository {

  constructor() {
    super(new UserVerification());
  }

  findByUserIdAndCode(id: number, code: number): Promise<UserVerification | null> {
    const expirationSeconds = 300;
    const query = `WHERE user_id =? AND ${UserVerification.tableName}.code =? AND (strftime('%s','now') - strftime('%s', ${UserVerification.tableName}.creation_time)) <?`;
    return this.baseFind(query, [id, code, expirationSeconds]);
  };
}

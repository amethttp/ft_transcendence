import { SQLiteBaseRepository } from "./SQLiteBaseRepository";
import { UserVerification } from "../../../domain/entities/UserVerification";
import { IUserVerificationRepository } from "../../../domain/repositories/IUserVerificationRepository";

export class SQLiteUserVerificationRepository extends SQLiteBaseRepository<UserVerification> implements IUserVerificationRepository {

  constructor() {
    super(UserVerification.tableName, UserVerification.entitySchema);
  }

  findByUserIdAndCode(id: number, code: number): Promise<UserVerification | null> {
    const expirationSeconds = 300;
    const query = `SELECT * FROM user_verification WHERE user_id =? AND code =? AND (strftime('%s','now') - strftime('%s', creation_time)) <?`;
    return this.dbGet(query, [id, code, expirationSeconds]);
  };
}

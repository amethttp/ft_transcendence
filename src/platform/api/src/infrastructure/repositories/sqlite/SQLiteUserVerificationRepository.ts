import { SQLiteBaseRepository } from "./SQLiteBaseRepository";
import { UserVerification } from "../../../domain/entities/UserVerification";
import { IUserVerificationRepository } from "../../../domain/repositories/IUserVerificationRepository";
import { DatabaseMapper } from "../../database/databaseMapper";

export class SQLiteUserVerificationRepository extends SQLiteBaseRepository<UserVerification> implements IUserVerificationRepository {

  constructor() {
    super(new UserVerification());
  }

  findByUserIdAndCode(id: number, code: number): Promise<UserVerification | null> {
    const expirationSeconds = 300;
    const query = DatabaseMapper.mapEntityToQuery(new UserVerification()) + `WHERE user.id =? AND ${UserVerification.tableName}.code =? AND (strftime('%s','now') - strftime('%s', ${UserVerification.tableName}.creation_time)) <?`; // TODO: inside base repo ....
    return this.dbGet(query, [id, code, expirationSeconds]);
  };
}

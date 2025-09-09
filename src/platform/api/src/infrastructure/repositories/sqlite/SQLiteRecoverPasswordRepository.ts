import { SQLiteBaseRepository } from "./SQLiteBaseRepository";
import { RecoverPassword } from "../../../domain/entities/RecoverPassword";
import { IRecoverPasswordRepository } from "../../../domain/repositories/IRecoverPasswordRepository";

export class SQLiteRecoverPasswordRepository extends SQLiteBaseRepository<RecoverPassword> implements IRecoverPasswordRepository {

  constructor() {
    super(RecoverPassword.tableName, RecoverPassword.entitySchema);
  }

  findByToken(token: string): Promise<RecoverPassword | null> {
    const expirationSeconds = 300;
    const query = `SELECT * FROM recover_password WHERE token =? AND (strftime('%s','now') - strftime('%s', creation_time)) <?`;
    return this.dbGet(query, [token, expirationSeconds]);
  };
}

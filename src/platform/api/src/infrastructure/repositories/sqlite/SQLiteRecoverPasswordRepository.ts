import { SQLiteBaseRepository } from "./SQLiteBaseRepository";
import { RecoverPassword } from "../../../domain/entities/RecoverPassword";
import { IRecoverPasswordRepository } from "../../../domain/repositories/IRecoverPasswordRepository";

export class SQLiteRecoverPasswordRepository extends SQLiteBaseRepository<RecoverPassword> implements IRecoverPasswordRepository {

  constructor() {
    super(new RecoverPassword());
  }

  findByToken(token: string): Promise<RecoverPassword | null> {
    const expirationSeconds = 300;
    const query = `WHERE ${RecoverPassword.tableName}.token =? AND (strftime('%s','now') - strftime('%s', ${RecoverPassword.tableName}.creation_time)) <?`;
    return this.baseFind(query, [token, expirationSeconds]);
  };
}

import { SQLiteBaseRepository } from "./SQLiteBaseRepository";
import { RecoverPassword } from "../../../domain/entities/RecoverPassword";
import { IRecoverPasswordRepository } from "../../../domain/repositories/IRecoverPasswordRepository";
import { DatabaseMapper } from "../../database/databaseMapper";

export class SQLiteRecoverPasswordRepository extends SQLiteBaseRepository<RecoverPassword> implements IRecoverPasswordRepository {

  constructor() {
    super(new RecoverPassword());
  }

  findByToken(token: string): Promise<RecoverPassword | null> {
    const expirationSeconds = 300;
    const query = DatabaseMapper.mapEntityToQuery(new RecoverPassword()) + `WHERE ${RecoverPassword.tableName}.token =? AND (strftime('%s','now') - strftime('%s', ${RecoverPassword.tableName}.creation_time)) <?`;
    return this.dbGet(query, [token, expirationSeconds]);
  };
}

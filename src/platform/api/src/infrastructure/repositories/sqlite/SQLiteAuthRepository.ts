import { Auth } from "../../../domain/entities/Auth";
import { IAuthRepository } from "../../../domain/repositories/IAuthRepository";
import { SQLiteBaseRepository } from "./SQLiteBaseRepository";

export class SQLiteAuthRepository extends SQLiteBaseRepository<Auth> implements IAuthRepository {

  constructor() {
    super(new Auth());
  }
}

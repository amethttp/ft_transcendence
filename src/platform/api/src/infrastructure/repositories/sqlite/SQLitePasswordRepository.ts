import { Password } from "../../../domain/entities/Password";
import { IPasswordRepository } from "../../../domain/repositories/IPasswordRepository";
import { SQLiteBaseRepository } from "./SQLiteBaseRepository";

export class SQLitePasswordRepository extends SQLiteBaseRepository<Password> implements IPasswordRepository {

  constructor() {
    super(new Password());
  }
}

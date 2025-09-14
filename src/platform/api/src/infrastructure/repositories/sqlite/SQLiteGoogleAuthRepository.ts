import { GoogleAuth } from "../../../domain/entities/GoogleAuth";
import { IGoogleAuthRepository } from "../../../domain/repositories/IGoogleAuthRepositroy";
import { SQLiteBaseRepository } from "./SQLiteBaseRepository";

export class SQLiteGoogleAuthRepository extends SQLiteBaseRepository<GoogleAuth> implements IGoogleAuthRepository {

  constructor() {
    super(new GoogleAuth());
  }
}
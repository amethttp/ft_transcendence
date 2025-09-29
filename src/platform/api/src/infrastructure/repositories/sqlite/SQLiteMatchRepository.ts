import { SQLiteBaseRepository } from "./SQLiteBaseRepository";
import { Match } from "../../../domain/entities/Match";
import { IMatchRepository } from "../../../domain/repositories/IMatchRepository";

export class SQLiteMatchRepository extends SQLiteBaseRepository<Match> implements IMatchRepository {

  constructor() {
    super(new Match());
  }
}

import { SQLiteBaseRepository } from "./SQLiteBaseRepository";
import { ITournamentRoundRepository } from "../../../domain/repositories/ITournamentRoundRepository";
import { TournamentRound } from "../../../domain/entities/TournamentRound";

export class SQLiteTournamentRoundRepository extends SQLiteBaseRepository<TournamentRound> implements ITournamentRoundRepository {

  constructor() {
    super(new TournamentRound());
  }
}

import { SQLiteBaseRepository } from "./SQLiteBaseRepository";
import { TournamentPlayer } from "../../../domain/entities/TournamentPlayer";
import { ITournamentPlayerRepository } from "../../../domain/repositories/ITournamentPlayerRepository";

export class SQLiteTournamentPlayerRepository extends SQLiteBaseRepository<TournamentPlayer> implements ITournamentPlayerRepository {

  constructor() {
    super(new TournamentPlayer());
  }

  findLastAmountByUser(id: number, amount: number): Promise<TournamentPlayer[] | null> {
    const query = `WHERE user_id =? ORDER BY tournament_id DESC LIMIT ${amount}`;
    return this.baseFindAll(query, [id]);
  }

  findAllByUser(id: number): Promise<TournamentPlayer[] | null> {
    const query = `WHERE user_id =? ORDER BY tournament_player.creation_time DESC`;
    return this.baseFindAll(query, [id]);
  }

  deleteAllByUser(id: number): Promise<boolean | null> {
    const query = `WHERE user_id=?`;
    return this.baseDelete(query, [id]);
  }
}

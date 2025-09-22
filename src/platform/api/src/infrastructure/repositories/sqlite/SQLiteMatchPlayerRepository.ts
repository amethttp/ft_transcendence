import { SQLiteBaseRepository } from "./SQLiteBaseRepository";
import { MatchPlayer } from "../../../domain/entities/MatchPlayer";
import { IMatchPlayerRepository } from "../../../domain/repositories/IMatchPlayerRepository";

export class SQLiteMatchPlayerRepository extends SQLiteBaseRepository<MatchPlayer> implements IMatchPlayerRepository {

  constructor() {
    super(new MatchPlayer());
  }

  findLastAmountByUser(id: number, amount: number): Promise<MatchPlayer[] | null> {
    const query = `WHERE user_id =? ORDER BY match_id DESC LIMIT ${amount}`;
    return this.baseFindAll(query, [id]);
  }

  findAllByUser(id: number): Promise<MatchPlayer[] | null> {
    const query = `WHERE user_id =?`;
    return this.baseFindAll(query, [id]);
  }

  deleteAllByUser(id: number): Promise<boolean | null> {
    const query = `WHERE user_id=?`;
    return this.baseDelete(query, [id]);
  }
}

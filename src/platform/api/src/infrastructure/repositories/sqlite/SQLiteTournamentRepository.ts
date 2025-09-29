import { SQLiteBaseRepository } from "./SQLiteBaseRepository";
import { Tournament } from "../../../domain/entities/Tournament";
import { ITournamentRepository } from "../../../domain/repositories/ITournamentRepository";

export class SQLiteTournamentRepository extends SQLiteBaseRepository<Tournament> implements ITournamentRepository {

  constructor() {
    super(new Tournament());
  }

  findAllByUser(id: number): Promise<Tournament[] | null> {
    const query = `WHERE user_id =?`;
    return this.baseFindAll(query, [id]);
  }

  deleteAllByUser(id: number): Promise<boolean | null> {
    const query = `WHERE user_id=?`;
    return this.baseDelete(query, [id]);
  }
}

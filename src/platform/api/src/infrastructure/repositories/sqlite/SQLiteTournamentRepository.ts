import { SQLiteBaseRepository } from "./SQLiteBaseRepository";
import { Tournament, tournamentSchema } from "../../../domain/entities/Tournament";
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

  findPublic(attributes: (keyof typeof tournamentSchema)[] = Object.keys(tournamentSchema)): Promise<Tournament[] | null> {
    const columns = attributes.map(attr => `'${attr}', ${this._entity.schema[attr]}`);
    const query = `
      SELECT
        json_object(${columns}) AS result
      FROM
        ${this._entity.tableName}
      WHERE
        is_visible = 1
        AND state = 1
    ;`;
    return this.dbAll(query, []);
  }
}

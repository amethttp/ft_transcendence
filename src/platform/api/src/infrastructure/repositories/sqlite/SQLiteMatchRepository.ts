import { SQLiteBaseRepository } from "./SQLiteBaseRepository";
import { Match, matchSchema } from "../../../domain/entities/Match";
import { IMatchRepository } from "../../../domain/repositories/IMatchRepository";

export class SQLiteMatchRepository extends SQLiteBaseRepository<Match> implements IMatchRepository {

  constructor() {
    super(new Match());
  }

  getPublic(attributes: (keyof typeof matchSchema)[] = Object.keys(matchSchema)): Promise<Match[] | null> {
    const columns = attributes.map(attr => `'${attr}', ${this._entity.schema[attr]}`);
    const query = `
      SELECT
        json_object(${columns}) AS result
      FROM
        ${this._entity.tableName}
      WHERE
        is_visible = 1
        AND state = 1
        AND tournament_round_id IS NULL
        AND (SELECT COUNT(id) FROM match_player WHERE match_id = match.id) < 2
    ;`;
    return this.dbAll(query, []);
  }
}

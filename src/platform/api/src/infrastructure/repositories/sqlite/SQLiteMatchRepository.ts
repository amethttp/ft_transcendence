import { SQLiteBaseRepository } from "./SQLiteBaseRepository";
import { Match, matchSchema } from "../../../domain/entities/Match";
import { IMatchRepository } from "../../../domain/repositories/IMatchRepository";
import { DatabaseMapper } from "../../database/DatabaseMapper";

export class SQLiteMatchRepository extends SQLiteBaseRepository<Match> implements IMatchRepository {

  constructor() {
    super(new Match());
  }

  findByToken(token: string): Promise<Match | null> {
    const matchCols = DatabaseMapper.getEntityColumns(this._entity);
    const matchJoins = DatabaseMapper.getEntityJoins(this._entity);
    const query = `
      SELECT json_object(
        ${matchCols},
        'players', (
          SELECT COALESCE(json_group_array(
            json_object(
              'id', mp.id,
              'score', mp.score,
              'isWinner', mp.is_winner,
              'user', json_object(
                'id', u.id,
                'email', u.email,
                'username', u.username,
                'avatarUrl', u.avatar_url,
                'creationTime', u.creation_time,
                'updateTime', u.update_time
              )
            )
          ), '[]')
          FROM match_player mp
          LEFT JOIN user u ON mp.user_id = u.id
          WHERE mp.match_id = match.id
        )
      ) AS result
      FROM
        match
      ${matchJoins}
      WHERE
            match.token =?;
    `;
    return this.dbGet(query, [token]);
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

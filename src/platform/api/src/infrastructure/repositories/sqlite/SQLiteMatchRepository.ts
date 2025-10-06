import { SQLiteBaseRepository } from "./SQLiteBaseRepository";
import { Match } from "../../../domain/entities/Match";
import { IMatchRepository } from "../../../domain/repositories/IMatchRepository";
import { DatabaseMapper } from "../../database/databaseMapper";

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
}

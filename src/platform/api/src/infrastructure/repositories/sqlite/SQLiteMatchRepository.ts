import { SQLiteBaseRepository } from "./SQLiteBaseRepository";
import { Match } from "../../../domain/entities/Match";
import { IMatchRepository } from "../../../domain/repositories/IMatchRepository";

export class SQLiteMatchRepository extends SQLiteBaseRepository<Match> implements IMatchRepository {

  constructor() {
    super(new Match());
  }

  findByToken(token: string): Promise<Match | null> {
    const query = `
      SELECT 
        match.*,
        (
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
        ) as players
      FROM
        match
      WHERE
            match.token =?;
    `;
    return this.dbRawGet(query, [token]);
  }
}

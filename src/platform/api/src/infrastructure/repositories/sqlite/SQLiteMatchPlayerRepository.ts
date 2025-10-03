import { SQLiteBaseRepository } from "./SQLiteBaseRepository";
import { MatchPlayer } from "../../../domain/entities/MatchPlayer";
import { IMatchPlayerRepository } from "../../../domain/repositories/IMatchPlayerRepository";

export class SQLiteMatchPlayerRepository extends SQLiteBaseRepository<MatchPlayer> implements IMatchPlayerRepository {

  constructor() {
    super(new MatchPlayer());
  }

  findAllUserMatchesInfo(id: number): Promise<MatchPlayer[] | null> {
    const query = `
      SELECT
        json_object(
          'id', match_player.id,
          'score', match_player.score,
          'isWinner', match_player.is_winner,
          'user', json_object(
            'id', user1.id,
            'email', user1.email,
            'username', user1.username,
            'avatarUrl', user1.avatar_url,
            'auth', json_object(
              'id', auth2.id,
              'lastLogin', auth2.last_login,
              'password', json_object(
                'id', password3.id,
                'hash', password3.hash,
                'updateTime', password3.update_time
              )
            ),
            'creationTime', user1.creation_time,
            'updateTime', user1.update_time
          ),
          'match', json_object(
            'id', match2.id,
            'name', match2.name,
            'token', match2.token,
            'isVisible', match2.is_visible,
            'state', match2.state,
            'tournamentRound', json_object(
              'id', tournament_round3.id,
              'top', tournament_round3.top,
              'token', tournament_round3.token,
              'tournament', json_object(
                'id', tournament4.id,
                'name', tournament4.name,
                'token', tournament4.token,
                'round', tournament4.round,
                'isVisible', tournament4.is_visible,
                'playersAmount', tournament4.players_amount,
                'state', tournament4.state,
                'creationTime', tournament4.creation_time,
                'finishTime', tournament4.finish_time
              ),
              'creationTime', tournament_round3.creation_time
            ),
            'creationTime', match2.creation_time,
            'finishTime', match2.finish_time,
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
              WHERE mp.match_id = match2.id
            )
          )
        ) AS result
      FROM match_player
      LEFT JOIN user user1 ON match_player.user_id = user1.id
      LEFT JOIN auth auth2 ON user1.auth_id = auth2.id
      LEFT JOIN password password3 ON auth2.password_id = password3.id
      LEFT JOIN match match2 ON match_player.match_id = match2.id
      LEFT JOIN tournament_round tournament_round3 ON match2.tournament_round_id = tournament_round3.id
      LEFT JOIN tournament tournament4 ON tournament_round3.tournament_id = tournament4.id
      WHERE user_id = ?;
    `;
    return this.dbAll(query, id);
  }

  findLastAmountByUser(id: number, amount: number): Promise<MatchPlayer[] | null> {
    const query = `WHERE user_id =? ORDER BY match_id DESC LIMIT ${amount}`;
    return this.baseFindAll(query, [id]);
  }

  findAllByUser(id: number): Promise<MatchPlayer[] | null> {
    const query = `WHERE user_id =?`;
    return this.baseFindAll(query, [id]);
  }

  findAllByMatch(id: number): Promise<MatchPlayer[] | null> {
    const query = `WHERE match_id =?`;
    return this.baseFindAll(query, [id]);
  }

  deleteAllByUser(id: number): Promise<boolean | null> {
    const query = `WHERE user_id=?`;
    return this.baseDelete(query, [id]);
  }
}

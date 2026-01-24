import { SQLiteBaseRepository } from "./SQLiteBaseRepository";
import { Tournament, tournamentSchema } from "../../../domain/entities/Tournament";
import { ITournamentRepository } from "../../../domain/repositories/ITournamentRepository";
import { TournamentMinified } from "../../../application/models/TournamentMinified";
import { DatabaseMapper } from "../../database/DatabaseMapper";

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

  findPublic(attributes: (keyof typeof tournamentSchema)[] = Object.keys(tournamentSchema)): Promise<TournamentMinified[] | null> {
    const columns = attributes.map(attr => this._entity.schema[attr] ? `'${attr}', ${this._entity.schema[attr]}` : null).filter(elem => elem);
    const query = `
      SELECT
        json_object(
          ${columns},
          'players', (SELECT COUNT(id) FROM tournament_player tp WHERE tp.tournament_id = tournament.id)
        ) AS result
      FROM
        ${this._entity.tableName}
      WHERE
        is_visible = 1
        AND state = 1
        AND round = 0
        AND (SELECT COUNT(id) FROM tournament_player tp WHERE tp.tournament_id = tournament.id) < players_amount
      ORDER BY ${this._entity.tableName}.creation_time DESC
    ;`;
    return this.dbAll(query, []) as Promise<TournamentMinified[] | null>;
  }

  findByToken(token: string): Promise<Tournament | null> {
    const entity = this._entity as Tournament;
    const columns = DatabaseMapper.getEntityColumns(this._entity);
    const joins = DatabaseMapper.getEntityJoins(this._entity);
    const query = `
      SELECT
        json_object(
          ${columns},
          'rounds', (
            SELECT COALESCE(json_group_array(
              json_object(
                  'top', ${entity.rounds[0].tableName}.top,
                  'matches', (
                    SELECT COALESCE(json_group_array(
                      json_object(
                        'name', match.name,
                        'token', match.token,
                        'state', match.state,
                        'players', (
                          SELECT COALESCE(json_group_array(
                            json_object(
                                'id', match_player.id,
                                'score', match_player.score,
                                'isWinner', match_player.is_winner,
                                'userId', match_player.user_id
                            )
                          ), '[]')
                          FROM match_player
                          WHERE match_player.match_id = match.id
                        )
                      )
                    ), '[]') 
                    FROM match
                    WHERE match.tournament_round_id = ${entity.rounds[0].tableName}.id
                  )
                )
            ), '[]')
            FROM ${entity.rounds[0].tableName}
            WHERE
              ${entity.rounds[0].tableName}.tournament_id = tournament.id
            ORDER BY ${entity.rounds[0].tableName}.creation_time
          ),
          'players', (
            SELECT COALESCE(json_group_array(
              json_object(
                'round', ${entity.players[0].tableName}.round,
                'isWinner', ${entity.players[0].tableName}.is_winner,
                'isAlive', ${entity.players[0].tableName}.is_alive,
                'id', ${entity.players[0].tableName}.id,
                'user', json_object(
                  'id', user1.id,
                  'username', user1.username,
                  'avatarUrl', user1.avatar_url
                )
              )
            ), '[]')
            FROM ${entity.players[0].tableName}
            ${DatabaseMapper.getEntityJoins(entity.players[0])}
            WHERE
              ${entity.players[0].tableName}.tournament_id = tournament.id
            ORDER BY ${entity.players[0].tableName}.creation_time DESC
          )
        ) AS result
      FROM
        ${this._entity.tableName}
      ${joins}
      WHERE
        tournament.token = ?
    ;`;
    return this.dbGet(query, [token]);
  }
}

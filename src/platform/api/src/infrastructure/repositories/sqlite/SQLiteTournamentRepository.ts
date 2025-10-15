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
    ;`;
    return this.dbAll(query, []) as Promise<TournamentMinified[] | null>;
  }

  findByToken(token: string): Promise<Tournament | null> {
    const entity = this._entity as Tournament;
    const columns = DatabaseMapper.getEntityColumns(this._entity);
    const joins = DatabaseMapper.getEntityJoins(this._entity);
    const roundsColumns = DatabaseMapper.getEntityColumns(entity.rounds[0]);
    const query = `
      SELECT
        json_object(
          ${columns},
          'rounds', (
            SELECT COALESCE(json_group_array(
              json_object(${roundsColumns})
            ), '[]')
            FROM ${entity.rounds[0].tableName}
            ${DatabaseMapper.getEntityJoins(entity.rounds[0])}
            WHERE
              ${entity.rounds[0].tableName}.tournament_id = tournament.id
          ),
          'players', (
            SELECT COALESCE(json_group_array(
              json_object(
                'round', ${entity.players[0].tableName}.round,
                'id', ${entity.players[0].tableName}.id,
                'user', json_object(
                  'username', user1.username,
                  'avatarUrl', user1.avatar_url
                )
              )
            ), '[]')
            FROM ${entity.players[0].tableName}
            ${DatabaseMapper.getEntityJoins(entity.players[0])}
            WHERE
              ${entity.players[0].tableName}.tournament_id = tournament.id
          )
        ) AS result
      FROM
        ${this._entity.tableName}
      ${joins}
      WHERE
        tournament.token = ?
    ;`;
    console.log("columns", columns);
    console.log("joins", joins);
    console.log(query);
    return this.dbGet(query, [token]);
  }
}

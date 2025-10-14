import { SQLiteBaseRepository } from "./SQLiteBaseRepository";
import { Tournament, tournamentSchema } from "../../../domain/entities/Tournament";
import { ITournamentRepository } from "../../../domain/repositories/ITournamentRepository";
import { TournamentMinified } from "../../../application/models/TournamentMinified";

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
    const query = `WHERE token =?`;
    return this.baseFind(query, [token]);
  }
}

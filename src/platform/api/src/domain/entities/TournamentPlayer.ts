import { AEntity } from "./AEntity";
import { User } from "./User";
import { Tournament } from "./Tournament";

const tournamentPlayerSchema: Record<string, string> = {
  id: "id",
  round: "round",
  user: "user_id",
  tournament: "tournament_id",
};

export class TournamentPlayer extends AEntity {
  static readonly tableName = "tournament_player";
  static readonly entitySchema = tournamentPlayerSchema;

  id!: number;
  round!: number;
  user!: User;
  tournament!: Tournament;

  constructor() {
    super();
    this.id = -1;
    this.round = 0;
    this.user = new User();
    this.tournament = new Tournament();
  }

  public get tableName(): string {
    return TournamentPlayer.tableName;
  }

  public get schema(): Record<string, string> {
    return TournamentPlayer.entitySchema;
  }
}
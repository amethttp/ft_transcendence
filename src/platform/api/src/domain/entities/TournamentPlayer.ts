import { AEntity } from "./AEntity";
import { User } from "./User";
import { TournamentRound } from "./TournamentRound";
import { Tournament } from "./Tournament";

const tournamentPlayerSchema: Record<string, string> = {
  id: "id",
  user: "user_id",
  round: "round",
  tournament: "tournament_id",
};

export class TournamentPlayer extends AEntity {
  static readonly tableName = "tournament_player";
  static readonly entitySchema = tournamentPlayerSchema;

  id!: number;
  user!: User;
  round!: TournamentRound;
  tournament!: Tournament;

  constructor() {
    super();
    this.id = -1;
    this.user = new User();
    this.round = new TournamentRound();
    this.tournament = new Tournament();
  }

  public get tableName(): string {
    return TournamentPlayer.tableName;
  }

  public get schema(): Record<string, string> {
    return TournamentPlayer.entitySchema;
  }
}
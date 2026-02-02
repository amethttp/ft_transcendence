import { AEntity } from "./AEntity";
import { User } from "./User";
import { Tournament } from "./Tournament";

const tournamentPlayerSchema: Record<string, string> = {
  id: "id",
  round: "round",
  isWinner: "is_winner",
  isAlive: "is_alive",
  user: "user_id",
  tournament: "tournament_id",
  creationTime: "creation_time",
};

export class TournamentPlayer extends AEntity {
  static readonly tableName = "tournament_player";
  static readonly entitySchema = tournamentPlayerSchema;

  id: number;
  round: number;
  isWinner: boolean;
  isAlive: boolean;
  user: User;
  tournament: Tournament;
  creationTime: string;

  constructor(tournament?: Tournament) {
    super();
    this.id = -1;
    this.round = 0;
    this.isWinner = false;
    this.isAlive = true;
    this.user = new User();
    if (tournament)
      this.tournament = tournament;
    else
    this.tournament = new Tournament();
    this.creationTime = (new Date()).toString();
  }

  public get tableName(): string {
    return TournamentPlayer.tableName;
  }

  public get schema(): Record<string, string> {
    return TournamentPlayer.entitySchema;
  }
}
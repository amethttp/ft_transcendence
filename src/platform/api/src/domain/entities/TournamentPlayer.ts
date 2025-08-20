import { AEntity } from "./AEntity";
import { User } from "./User";
import { TournamentRound } from "./TournamentRound";
import { Tournament } from "./Tournament";

const tournamentPlayerSchema: Record<string, string> = {
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
}
import { AEntity } from "./AEntity";
import { Match } from "./Match";
import { Tournament } from "./Tournament";

const tournamentRoundSchema: Record<string, string> = {
  top: "top",
  token: "token",
  tournament: "tournament_id",
  creationTime: "creation_time",
};

export class TournamentRound extends AEntity {
  static readonly tableName = "tournament_round";
  static readonly entitySchema = tournamentRoundSchema;

  id!: number;
  top!: string;
  token!: string;
  matches!: Match[]; // TO DO: check these types of relationships || in impementation repo implement find all matches...
  tournament!: Tournament;
  creationTime!: Date;
}
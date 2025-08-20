import { AEntity } from "./AEntity";
import { MatchPlayer } from "./MatchPlayer";
import { TournamentRound } from "./TournamentRound";

const matchSchema: Record<string, string> = {
  name: "name",
  token: "token",
  type: "type",
  isVisible: "is_visible",
  state: "state",
  tournamentRound: "tournament_round_id",
  creationTime: "creation_time",
  finishTime: "finish_time",
};

export class Match extends AEntity {
  static readonly tableName = "match";
  static readonly entitySchema = matchSchema;

  id!: number;
  name!: string;
  token!: string;
  type!: number;
  isVisible!: boolean;
  state!: number;
  players!: MatchPlayer[];
  tournamentRound?: TournamentRound;
  creationTime!: Date;
  finishTime?: Date;
}

import { AEntity } from "./AEntity";
import { TournamentRound } from "./TournamentRound";

const tournamentSchema: { [key: string]: string } = {
  name: "name",
  token: "token",
  round: "round",
  isVisible: "is_visible",
  playersAmount: "players_amount",
  state: "state",
  creationTime: "creation_time",
  finishTime: "finish_time",
};

export class Tournament extends AEntity {
  static readonly tableName = "tournament";
  static readonly entitySchema = tournamentSchema;

  id!: number;
  name!: string;
  token!: string;
  round!: number;
  isVisible!: boolean;
  playersAmount!: number;
  state!: number;
  tournamentRounds!: TournamentRound[];
  creationTime!: Date;
  finishTime?: Date;
}
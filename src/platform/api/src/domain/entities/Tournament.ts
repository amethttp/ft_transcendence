import { AEntity } from "./AEntity";
import { TournamentRound } from "./TournamentRound";

export const tournamentSchema: Record<string, string> = {
  id: "id",
  name: "name",
  token: "token",
  round: "round",
  isVisible: "is_visible",
  playersAmount: "players_amount",
  state: "state",
  points: "points",
  creationTime: "creation_time",
  finishTime: "finish_time",
};

export class Tournament extends AEntity {
  static readonly tableName = "tournament";
  static readonly entitySchema = tournamentSchema;

  id: number;
  name: string;
  token: string;
  round: number;
  isVisible: boolean;
  playersAmount!: number;
  state: number;
  points: number;
  tournamentRounds: TournamentRound[];
  creationTime: string;
  finishTime?: string;

  constructor() {
    super();
    this.id = -1;
    this.name = "";
    this.token = "";
    this.round = 0;
    this.isVisible = false;
    this.playersAmount = 0;
    this.state = 0;
    this.points = 10;
    this.tournamentRounds = undefined as unknown as TournamentRound[];// [new TournamentRound()]
    this.creationTime = "";
    this.finishTime = "";
  }

  public get tableName(): string {
    return Tournament.tableName;
  }

  public get schema(): Record<string, string> {
    return Tournament.entitySchema;
  }
}
import { AEntity } from "./AEntity";
import { TournamentPlayer } from "./TournamentPlayer";
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

export const TournamentState: Record<string, number> = {
  WAITING: 1,
  CLOSED: 2,
  IN_PROGRESS: 3,
  FINISHED: 4
} as const;

export type TournamentStateValue = typeof TournamentState[keyof typeof TournamentState];

export class Tournament extends AEntity {
  static readonly tableName = "tournament";
  static readonly entitySchema = tournamentSchema;

  id: number;
  name: string;
  token: string;
  round: number;
  isVisible: boolean;
  playersAmount!: number;
  state: TournamentStateValue;
  points: number;
  rounds: TournamentRound[];
  players: TournamentPlayer[];
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
    this.state = TournamentState.WAITING;
    this.points = 10;
    this.rounds = [new TournamentRound(this)];
    this.players = [new TournamentPlayer(this)];
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
import { AEntity } from "./AEntity";
import { MatchPlayer } from "./MatchPlayer";
import { TournamentRound } from "./TournamentRound";

export const MatchState = {
  WAITING: 1,
  IN_PROGRESS: 2,
  FINISHED: 3
} as const;

export type MatchStateKey = keyof typeof MatchState;
export type MatchStateValue = (typeof MatchState)[MatchStateKey];

export const MatchStateByValue = {
  1: "WAITING",
  2: "IN_PROGRESS",
  3: "FINISHED",
} satisfies Record<MatchStateValue, MatchStateKey>;

export const matchSchema: Record<string, string> = {
  id: "id",
  name: "name",
  token: "token",
  isVisible: "is_visible",
  state: "state",
  points: "points",
  tournamentRound: "tournament_round_id",
  creationTime: "creation_time",
  finishTime: "finish_time",
};

export class Match extends AEntity {
  static readonly tableName = "match";
  static readonly entitySchema = matchSchema;

  id: number;
  name: string;
  token: string;
  points: number;
  isVisible: boolean;
  state: MatchStateValue;
  players: MatchPlayer[]; 
  tournamentRound?: TournamentRound;
  creationTime: string;
  finishTime?: string;

  constructor() {
    super();
    this.id = -1;
    this.name = "";
    this.token = "";
    this.points = 10;
    this.isVisible = false;
    this.state = 1;
    this.players = []; // [MatchPlayer]
    this.tournamentRound = new TournamentRound();
    this.creationTime = "";
    this.finishTime = "";
  }

  public get tableName(): string {
    return Match.tableName;
  }

  public get schema(): Record<string, string> {
    return Match.entitySchema;
  }
}

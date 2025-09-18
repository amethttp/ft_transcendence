import { AEntity } from "./AEntity";
import { MatchPlayer } from "./MatchPlayer";
import { TournamentRound } from "./TournamentRound";

const matchSchema: Record<string, string> = {
  id: "id",
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
  players!: MatchPlayer[]; // TODO: check mapper with []
  tournamentRound?: TournamentRound;
  creationTime!: string;
  finishTime?: string;

  constructor() {
    super();
    this.id = -1;
    this.name = "";
    this.token = "";
    this.type = -1;
    this.isVisible = false;
    this.state = 0;
    this.players = [new MatchPlayer()];
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

import { AEntity } from "./AEntity";
import { Match } from "./Match";
import { Tournament } from "./Tournament";

const tournamentRoundSchema: Record<string, string> = {
  id: "id",
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
  matches!: Match[];
  tournament!: Tournament;
  creationTime!: string;

  constructor() {
    super();
    this.id = -1;
    this.top = "";
    this.token = "";
    this.matches = undefined as unknown as Match[]; // [new Match()]
    this.tournament = new Tournament();
    this.creationTime = "";
  }

  public get tableName(): string {
    return TournamentRound.tableName;
  }

  public get schema(): Record<string, string> {
    return TournamentRound.entitySchema;
  }
}

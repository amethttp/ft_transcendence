import { AEntity } from "./AEntity";
import { Match } from "./Match";
import { User } from "./User";

const matchPlayerSchema: Record<string, string> = {
  id: "id",
  score: "score",
  isWinner: "is_winner",
  user: "user_id",
  match: "match_id",
};

export class MatchPlayer extends AEntity {
  static readonly tableName = "match_player";
  static readonly entitySchema = matchPlayerSchema;

  id!: number;
  score!: number;
  isWinner!: boolean;
  user!: User;
  match!: Match;

  constructor() {
    super();
    this.id = -1;
    this.score = 0;
    this.isWinner = false;
    this.user = new User();
    this.match = new Match();
  }

  public get tableName(): string {
    return MatchPlayer.tableName;
  }

  public get schema(): Record<string, string> {
    return MatchPlayer.entitySchema;
  }
}
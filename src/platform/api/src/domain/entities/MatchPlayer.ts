import { AEntity } from "./AEntity";
import { Match } from "./Match";
import { User } from "./User";

const matchPlayerSchema: Record<string, string> = {
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
}
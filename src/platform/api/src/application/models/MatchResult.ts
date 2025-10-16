import { Player } from "./Player";

export interface MatchResult {
  score: number[];
  players: Player[];
  state: string;
}

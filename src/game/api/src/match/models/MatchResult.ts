import { TMatchState } from "./MatchState";
import { Player } from "./Player";

export interface MatchResult {
  score: number[];
  players: Player[];
  state: TMatchState;
}
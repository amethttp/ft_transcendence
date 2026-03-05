import { TMatchState } from "./MatchState";
import { TMatchMode } from "./MatchMode";

export interface MatchSettings {
  maxScore: number;
  local: boolean;
  mode: TMatchMode;
  tournament: boolean;
  state: TMatchState;
  creationTime: string;
  score: number[];
  playerIds?: number[];
}
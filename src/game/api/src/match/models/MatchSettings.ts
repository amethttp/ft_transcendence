import { TMatchState } from "./MatchState";

export interface MatchSettings {
  maxScore: number;
  local: boolean;
  state: TMatchState;
}
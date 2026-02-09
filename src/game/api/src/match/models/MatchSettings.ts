import { TMatchState } from "./MatchState";

export interface MatchSettings {
  maxScore: number;
  local: boolean;
  tournament: boolean;
  state: TMatchState;
  creationTime: string;
  score: number[];
}
import { UserMatchState } from "./UserMatchDownloadDto";

export interface MatchSettings {
  maxScore: number;
  local: boolean;
  state: UserMatchState;
  creationTime: string;
  score: number[];
}
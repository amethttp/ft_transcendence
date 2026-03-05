import { UserMatchState } from "./UserMatchDownloadDto";
import { MatchModeValue } from "../../domain/entities/Match";

export interface MatchSettings {
  maxScore: number;
  local: boolean;
  mode: MatchModeValue;
  tournament: boolean;
  state: UserMatchState;
  creationTime: string;
  score: number[];
  playerIds?: number[];
}
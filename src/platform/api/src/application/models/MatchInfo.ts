import { UserProfileResponse } from "./UserProfileResponse";

export interface MatchInfo {
  name: string,
  state: number,
  score: number,
  opponentScore: number,
  opponent: UserProfileResponse,
  isWinner: boolean,
  finishTime: string,
}
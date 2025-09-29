import type UserProfile from "../../models/UserProfile";

export interface MatchInfo {
  name: string,
  state: number,
  score: number,
  opponentScore: number,
  opponent: UserProfile,
  isWinner: boolean,
  finishTime: string,
}
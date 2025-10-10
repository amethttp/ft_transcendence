import type UserProfile from "../../../UserComponent/models/UserProfile";

export interface MatchPlayer {
  id: number;
  isWinner: boolean;
  score: number;
  user: UserProfile;
}
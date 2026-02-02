import type UserProfile from "../../../UserComponent/models/UserProfile";

export interface TournamentPlayer {
  id: number;
  round: number;
  isWinner: boolean;
  isAlive: boolean;
  user: UserProfile;
}
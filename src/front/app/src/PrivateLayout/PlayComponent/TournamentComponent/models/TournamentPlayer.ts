import type UserProfile from "../../../UserComponent/models/UserProfile";

export interface TournamentPlayer {
  id: number;
  round: number;
  user: UserProfile;
}
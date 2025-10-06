import type UserProfile from "../../../UserComponent/models/UserProfile";

export interface MatchJoinResponse {
  id: number;
  name: string;
  token: string;
  type: number;
  isVisible: boolean;
  state: number;
  players: UserProfile[];
  creationTime: string;
  finishTime?: string;
}

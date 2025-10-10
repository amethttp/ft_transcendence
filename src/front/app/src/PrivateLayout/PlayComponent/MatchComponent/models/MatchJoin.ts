import type { MatchPlayer } from "./MatchPlayer";

export interface MatchJoin {
  id: number;
  name: string;
  token: string;
  points: number;
  isVisible: boolean;
  state: number;
  players: MatchPlayer[];
  creationTime: string;
  finishTime?: string;
}

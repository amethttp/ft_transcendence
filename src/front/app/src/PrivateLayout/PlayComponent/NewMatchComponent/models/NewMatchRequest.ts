import type { PlayerTypeValue } from "../../MatchComponent/MatchComponent";

export interface NewMatchRequest {
  name: string;
  points: number;
  isVisible: boolean;
  mode: PlayerTypeValue;
}
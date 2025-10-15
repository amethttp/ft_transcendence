import type { TournamentPlayer } from "./TournamentPlayer";
import type { TournamentRound } from "./TournamentRound";

export interface Tournament {
  id: number;
  name: string;
  token: string;
  round: number;
  isVisible: boolean;
  playersAmount: number;
  state: number;
  points: number;
  tournamentRounds: TournamentRound[];
  players: TournamentPlayer[];
  creationTime: string;
  finishTime?: string;
}
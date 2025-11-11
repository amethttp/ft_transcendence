import type { TournamentPlayer } from "./TournamentPlayer";
import type { TournamentRound } from "./TournamentRound";

export const TournamentState = {
  WAITING: 1,
  CLOSED: 2,
  IN_PROGRESS: 3,
  FINISHED: 4
} as const;

export type TournamentStateValue = typeof TournamentState[keyof typeof TournamentState];

export interface Tournament {
  id: number;
  name: string;
  token: string;
  round: number;
  isVisible: boolean;
  playersAmount: number;
  state: TournamentStateValue;
  points: number;
  rounds: TournamentRound[];
  players: TournamentPlayer[];
  creationTime: string;
  finishTime?: string;
}
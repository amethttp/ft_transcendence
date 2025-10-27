import type { TournamentMatchPlayer } from "./TournamentMatchPlayer";

export const MatchState = {
  WAITING: 1,
  IN_PROGRESS: 2,
  FINISHED: 3
} as const;

export type MatchStateValue = typeof MatchState[keyof typeof MatchState];

export interface TournamentMatch {
  token: string;
  players: TournamentMatchPlayer[];
  state: MatchStateValue;
}
export interface Tournament {
  id: number;
  name: string;
  token: string;
  round: number;
  isVisible: boolean;
  playersAmount: number;
  state: number;
  points: number;
  // tournamentRounds: TournamentRound[];
  creationTime: string;
  finishTime?: string;
}
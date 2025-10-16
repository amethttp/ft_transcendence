import { TournamentRound } from "../../domain/entities/TournamentRound";

export interface NewMatchRequest {
  name: string;
  points: number;
  isVisible: boolean;
  tournamentRound?: TournamentRound;
}
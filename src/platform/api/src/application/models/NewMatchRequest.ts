import { TournamentRound } from "../../domain/entities/TournamentRound";
import { MatchModeValue } from "../../domain/entities/Match";

export interface NewMatchRequest {
  name: string;
  points: number;
  isVisible: boolean;
  tournamentRound?: TournamentRound;
  mode: MatchModeValue;
}
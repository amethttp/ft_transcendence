import { MatchInfo } from "./MatchInfo";
import { TournamentInfo } from "./TournamentInfo";

export interface UserStatsResponse {
  last10Matches: MatchInfo[],
  last10Tournaments: TournamentInfo[],
  totalMatches: number,
  matchesWon: number,
  totalTournaments: number,
  tournamentAvg: number,
}
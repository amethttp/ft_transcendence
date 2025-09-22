import { MatchInfo } from "./MatchInfo";
import { TournamentInfo } from "./TournamentInfo";

export interface UserStatsResponse {
  last10Matches: MatchInfo[],
  last10Torunaments: TournamentInfo[],
  totalMatches: number,
  matchWinRate: number,
  totalTournaments: number,
  tournamentAvg: number,
}
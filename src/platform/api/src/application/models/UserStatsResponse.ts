import { MatchInfo } from "./MatchInfo";
import { TournamentInfo } from "./TournamentInfo";

export interface UserStatsResponse {
  last10Matches: MatchInfo[],
  last10Tournaments: TournamentInfo[],
  validTotalMatches: number,
  totalMatches: number,
  victories: number,
  validTotalTournaments: number,
  totalTournaments: number,
  tournamentAvg: number,
}
import type { MatchInfo } from "./MatchInfo";
import type { TournamentInfo } from "./TournamentInfo";

export interface UserStats {
  last10Matches: MatchInfo[],
  last10Tournaments: TournamentInfo[],
  validTotalMatches: number,
  totalMatches: number,
  victories: number,
  validTotalTournaments: number,
  totalTournaments: number,
  tournamentAvg: number,
}
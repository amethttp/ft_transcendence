
import type { MatchInfo } from "./MatchInfo";
import type { TournamentInfo } from "./TournamentInfo";

export interface UserStats {
  last10Matches: MatchInfo[],
  last10Tournaments: TournamentInfo[],
  totalMatches: number,
  victories: number,
  totalTournaments: number,
  tournamentAvg: number,
}

import type { MatchInfo } from "./MatchInfo";
import type { TournamentInfo } from "./TournamentInfo";

export interface UserStats {
  last10Matches: MatchInfo[],
  last10Torunaments: TournamentInfo[],
  totalMatches: number,
  matchesWon: number,
  totalTournaments: number,
  tournamentAvg: number,
}
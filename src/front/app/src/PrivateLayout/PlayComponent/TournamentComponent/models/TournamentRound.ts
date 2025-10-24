import type { TournamentMatch } from "./TournamentMatch";

export class TournamentRound {
  static readonly powersOfTwo = [2, 4, 8, 16, 32, 64];
  static readonly roundsText = ["Final", "Semifinals", "Quarterfinals", "Round of 16", "Round of 32", "Round of 64"];
  top: string;
  matches: TournamentMatch[];

  constructor() {
    this.top = "";
    this.matches = [];
  }
}
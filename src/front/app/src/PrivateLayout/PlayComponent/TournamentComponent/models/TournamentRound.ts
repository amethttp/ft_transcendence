import type { TournamentMatch } from "./TournamentMatch";

export class TournamentRound {
  static readonly powersOfTwo = [4, 8, 16, 32, 64];
  static readonly roundsText = ["Semifinals", "Quarterfinals", "Round of 16", "Round of 32", "Round of 64"];
  top: string;
  matches: TournamentMatch[];

  constructor() {
    this.top = "";
    this.matches = [];
  }
}
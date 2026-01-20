import AmethComponent from "../../../../framework/AmethComponent";
import type { Router } from "../../../../framework/Router/Router";
import type { Tournament } from "../../TournamentComponent/models/Tournament";

export class MatchEndedMenu extends AmethComponent {
  template = () => import("./MatchEndedMenu.html?raw");

  private _winner: boolean;
  private _tournament?: Tournament;

  constructor(winner: boolean, router?: Router, tournament?: Tournament) {
    super();
    this.router = router;
    this._winner = winner;
    this._tournament = tournament;
  }

  async init(selector: string, router?: Router): Promise<void> {
    await super.init(selector, router);
    document.getElementById("MatchEndedMenuTitle")!.textContent = this._winner ? "You won :)" : "Game over :(";
    if (this._tournament) {
      if (this._winner) {
        document.getElementById("MatchEndedMenuSubtitle")!.textContent = "You advance to the next round!";
        const ctaElement = document.getElementById("MatchEndedTournamentCta") as HTMLAnchorElement;
        ctaElement.href = `/play/tournament/${this._tournament.token}`;
        ctaElement.classList.remove("hidden");
      } else {
        document.getElementById("MatchEndedMenuSubtitle")!.textContent = "Better luck next time!";
        const ctaElement = document.getElementById("MatchEndedTournamentBack") as HTMLAnchorElement;
        ctaElement.href = `/play/tournament/${this._tournament.token}`;
        ctaElement.classList.remove("hidden");
      }
    }
  }
}
import Alert from "../../../framework/Alert/Alert";
import AmethComponent from "../../../framework/AmethComponent";
import { TitleHelper } from "../../../framework/TitleHelper/TitleHelper";
import { DOMHelper } from "../../../utils/DOMHelper";
import type { Tournament } from "./models/Tournament";
import { TournamentService } from "./services/TournamentService";

export default class TournamentComponent extends AmethComponent {
  template = () => import("./TournamentComponent.html?raw");
  private _tournamentService: TournamentService;
  private _tournament?: Tournament;

  constructor() {
    super();
    this._tournamentService = new TournamentService();
  }

  async afterInit() {
    await this._setTournament();
    this._fillView();
    this._setTitle();
  }

  async refresh() {
    await this._setTournament();
    this._fillView();
    this._setTitle();
  }

  private _clearView() {
    document.getElementById("tournamentName")!.innerHTML = "";
    document.getElementById("tournamentVisibility")!.innerHTML = "";
    document.getElementById("tournamentPoints")!.innerHTML = "";
    document.getElementById("tournamentPlayersAmount")!.innerHTML = "";
    document.getElementById("tournamentPlayers")!.innerHTML = "";
  }

  private _fillView() {
    this._clearView();
    if (!this._tournament)
      return;
    document.getElementById("tournamentName")!.innerText = this._tournament.name;
    document.getElementById("tournamentVisibility")!.innerText = this._tournament.isVisible ? "Public" : "Private";
    document.getElementById("tournamentPoints")!.innerText = this._tournament.points + "";
    document.getElementById("tournamentPlayersAmount")!.innerText = this._tournament.playersAmount + "";
    this._fillPlayers();
  }

  private _fillPlayers() {
    if (this._tournament && this._tournament.players && this._tournament.players.length > 0) {
      const container = document.getElementById("tournamentPlayers")!;
      for (const player of this._tournament.players.sort((a, b) => a.round - b.round)) {
        let status;
        if (this._tournament.round === player.round) {
          status = `<span class="text-xs top-0.5 relative bg-green-50 outline-1 outline-green-200 p-0.5 rounded">alive</span>`;
        }
        else {
          status = `<span class="text-xs top-0.5 relative bg-red-50 outline-1 outline-red-100 p-0.5 rounded">dead</span>`;
        }
        const htmlElem = `
          <a href="${player.user.username}" class="flex items-center gap-2">
            <img src="${player.user.avatarUrl}" width="40" height="40" class="aspect-square w-10 h-10 rounded-full overflow-hidden object-cover"></img>
            <span>${DOMHelper.sanitizeHTML(player.user.username)}</span>
            ${status}
          </a>
        `;
        container.prepend(DOMHelper.createElementFromHTML(htmlElem));
      }
    }
  }

  private async _setTournament() {
    try {
      const token = this.router?.currentPath.params.token;
      if (token)
        this._tournament = await this._tournamentService.getByToken(token as string);
    } catch (error) {
      Alert.error("Couldn't retrieve Tournament");
      console.warn(error);
    }
  }

  private _setTitle() {
    if (this._tournament) {
      document.title = TitleHelper.addTitlePart(this._tournament.name);
    }
  }
}
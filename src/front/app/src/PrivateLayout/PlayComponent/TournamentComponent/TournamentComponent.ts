import Alert from "../../../framework/Alert/Alert";
import AmethComponent from "../../../framework/AmethComponent";
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
    await this.setTournament();
    this._fillView();
  }

  async refresh() {
    await this.setTournament();
    this._fillView();
  }

  private _clearView() {
    document.getElementById("tournamentName")!.innerHTML = "";
    document.getElementById("tournamentVisibility")!.innerHTML = "";
    document.getElementById("tournamentPoints")!.innerHTML = "";
    document.getElementById("tournamentPlayersAmount")!.innerHTML = "";
  }

  private _fillView() {
    this._clearView();
    if (!this._tournament)
      return;
    document.getElementById("tournamentName")!.innerText = this._tournament.name;
    document.getElementById("tournamentVisibility")!.innerText = this._tournament.isVisible ? "Public" : "Private";
    document.getElementById("tournamentPoints")!.innerText = this._tournament.points + "";
    document.getElementById("tournamentPlayersAmount")!.innerText = this._tournament.playersAmount + "";
  }

  async setTournament() {
    try {
      const token = this.router?.currentPath.params.token;
      if (token)
        this._tournament = await this._tournamentService.getByToken(token as string);
    } catch (error) {
      Alert.error("Couldn't retrieve Tournament");
      console.warn(error);
    }
  }
}
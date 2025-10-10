import Alert from "../../../../framework/Alert/Alert";
import AmethComponent from "../../../../framework/AmethComponent";
import DateUtils from "../../../../utils/DateUtils";
import { DOMHelper } from "../../../../utils/DOMHelper";
import type { TournamentMinified } from "./models/TournamentMinified";
import { TournamentsListService } from "./services/TournamentsListService";

export default class TournamentsListComponent extends AmethComponent {
  template = () => import("./TournamentsListComponent.html?raw");
  private _tournamentsListService: TournamentsListService;
  private _tournaments: TournamentMinified[];
  private _container?: HTMLDivElement;
  private _interval?: number;

  constructor() {
    super();
    this._tournamentsListService = new TournamentsListService();
    this._tournaments = [];
  }

  async afterInit() {
    this._container = this.outlet?.getElementsByClassName("TournamentsListContainer")[0] as HTMLDivElement;
    await this._setTournaments();
    this._fillView();
    this._interval = setInterval(() => {
      this._setTournaments().then(() => this._fillView());
    }, 20000);
  }

  async refresh() {
    await this._setTournaments();
    this._fillView();
  }

  private async _setTournaments() {
    try {
      this._tournaments = await this._tournamentsListService.getList();
    }
    catch (err: any) {
      console.warn(err);
      Alert.error("Something occurred with tournaments");
    }
  }

  private _clearView() {
    if (this._container) {
      this._container.innerHTML = "";
    }
  }

  private _fillView() {
    this._clearView();
    if (this._tournaments.length > 0) {
      this._fillList();
    }
  }

  private _fillList() {
    if (this._container) {
      for (const tournament of this._tournaments) {
        const html = `
          <a title="Join ${tournament.name} tournament" href="/play/tournament/${tournament.token}" class="flex flex-wrap w-full text-center sm:text-left sm:justify-center text-center items-center gap-8 rounded shadow p-2 sm:p-4 outline-2 outline-brand-800 hover:shadow-md transition-all hover:bg-gray-50">
            <div class="flex-1">${DOMHelper.sanitizeHTML(tournament.name)}</div>
            <div class="flex flex-1 sm:flex-none gap-5 justify-center items-center">
            <span class="whitespace-nowrap">${tournament.players}/${tournament.playersAmount}</span>
            <span class="whitespace-nowrap">${tournament.points}pts</span>
            <span class="whitespace-nowrap">${DateUtils.timeAgo(tournament.creationTime)}</span>
            <div class="btn btn-secondary">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15M12 9l3 3m0 0-3 3m3-3H2.25" />
              </svg>
            </div>
            </div>
          </a>
        `;
        this._container.prepend(DOMHelper.createElementFromHTML(html))
      }
    }
  }

  async destroy() {
    clearInterval(this._interval);
    await super.destroy();
  }
}

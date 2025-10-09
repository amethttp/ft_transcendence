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
      for (const tournament of [...this._tournaments].reverse()) {
        const html = `
          <a href="/play/tournament/${tournament.token}" class="flex flex-wrap w-full text-center sm:text-left sm:justify-center text-center items-center gap-8 rounded shadow p-2 sm:p-4 outline-2 outline-brand-800 hover:shadow-md transition-all hover:bg-gray-50">
            <div class="flex-1">${DOMHelper.sanitizeHTML(tournament.name)}</div>
            <div class="flex flex-1 sm:flex-none gap-5 justify-center items-center">
            <span>${tournament.players} / ${tournament.playersAmount}</span>
            <span>${tournament.points}pts</span>
              <span>${DateUtils.timeAgo(tournament.creationTime)}</span>
              <div class="btn btn-secondary">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-4">
                 <path stroke-linecap="round" stroke-linejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
               </svg>
              </div>
            </div>
          </a>
        `;
        this._container.appendChild(DOMHelper.createElementFromHTML(html))
      }
    }
  }

  async destroy() {
    clearInterval(this._interval);
    await super.destroy();
  }
}

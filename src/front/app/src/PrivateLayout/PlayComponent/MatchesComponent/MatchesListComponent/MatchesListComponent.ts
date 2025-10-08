import Alert from "../../../../framework/Alert/Alert";
import AmethComponent from "../../../../framework/AmethComponent";
import DateUtils from "../../../../utils/DateUtils";
import { DOMHelper } from "../../../../utils/DOMHelper";
import type { MatchMinified } from "./models/MatchMinified";
import { MatchListService } from "./services/MatchListService";

export default class MatchesListComponent extends AmethComponent {
  template = () => import("./MatchesListComponent.html?raw");
  private _matchListService: MatchListService;
  private _matches: MatchMinified[];
  private _container?: HTMLDivElement;

  constructor() {
    super();
    this._matchListService = new MatchListService();
    this._matches = [];
  }

  async afterInit() {
    this._container = this.outlet?.getElementsByClassName("MatchesListContainer")[0] as HTMLDivElement;
    await this._setMatches();
    this._fillView();
  }

  async refresh() {
    await this._setMatches();
    this._fillView();
  }

  private async _setMatches() {
    try {
      this._matches = await this._matchListService.getMatches();
    }
    catch (err: any) {
      console.warn(err);
      Alert.error("Something occurred with matches");
    }
  }

  private _clearView() {
    if (this._container) {
      this._container.innerHTML = "";
    }
  }

  private _fillView() {
    this._clearView();
    if (this._matches.length > 0) {
      this._fillMatches();
    }
  }

  private _fillMatches() {
    if (this._container) {
      for (const match of this._matches.reverse()) {
        const html = `
          <a href="/play/${match.token}" class="flex flex-wrap w-full text-center sm:text-left sm:justify-center text-center items-center gap-8 rounded shadow p-2 sm:p-4 outline-2 outline-brand-800 hover:shadow-md transition-all hover:bg-gray-50">
            <div class="flex-1">${DOMHelper.sanitizeHTML(match.name)}</div>
            <div class="flex flex-1 sm:flex-none gap-5 justify-center items-center">
            <span>${match.points}pts</span>
              <span>${DateUtils.timeAgo(match.creationTime)}</span>
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
}
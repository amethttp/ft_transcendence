import AmethComponent from "../../../framework/AmethComponent";
import type { Router } from "../../../framework/Router/Router";
import TournamentsListComponent from "./TournamentsListComponent/TournamentsListComponent";

export default class TournamentsComponent extends AmethComponent {
  template = () => import("./TournamentsComponent.html?raw");
  private _listComponent: TournamentsListComponent;

  constructor() {
    super();
    this._listComponent = new TournamentsListComponent();
  }

  async init(selector: string, router?: Router): Promise<void> {
    await super.init(selector, router);
    await this._listComponent.init("tournamentsList", router);
  }

  afterInit(): void {
    this._listComponent.afterInit();
  }

  refresh(): void {
    this._listComponent.refresh();
  }

  async destroy() {
    await this._listComponent.destroy();
    await super.destroy();
  }
}
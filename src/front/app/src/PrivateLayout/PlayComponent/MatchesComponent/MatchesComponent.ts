import AmethComponent from "../../../framework/AmethComponent";
import type { Router } from "../../../framework/Router/Router";
import MatchesListComponent from "./MatchesListComponent/MatchesListComponent";

export default class MatchesComponent extends AmethComponent {
  template = () => import("./MatchesComponent.html?raw");
  private _matchesListComponent: MatchesListComponent;

  constructor() {
    super();
    this._matchesListComponent = new MatchesListComponent();
  }

  async init(selector: string, router?: Router) {
    await super.init(selector, router);
    await this._matchesListComponent.init("MatchesComponentList", this.router);
  }

  afterInit(): void {
    this._matchesListComponent.afterInit();
  }

  async refresh() {
    await this._matchesListComponent.refresh();
  }

  async destroy(): Promise<void> {
    await this._matchesListComponent.destroy();
    await super.destroy();
  }
}
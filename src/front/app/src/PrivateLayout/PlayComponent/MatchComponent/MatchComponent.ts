import AmethComponent from "../../../framework/AmethComponent";
import type { Router } from "../../../framework/Router/Router";
import MatchEngineComponent from "./MatchEngineComponent/MatchEngineComponent";
import type { MatchJoin } from "./models/MatchJoin";
import { MatchService } from "./services/MatchService";

export default class MatchComponent extends AmethComponent {
  template = () => import("./MatchComponent.html?raw");
  private _matchEngineComponent?: MatchEngineComponent;
  private _matchService: MatchService;
  private _match?: MatchJoin;

  constructor() {
    super();
    this._matchService = new MatchService();
  }

  async init(selector: string, router?: Router): Promise<void> {
    await super.init(selector, router);

    const token = this.router?.currentPath.params["token"] as string;
    this._matchEngineComponent = new MatchEngineComponent(token);
    await this._matchEngineComponent?.init("matchEngineContainer", this.router);
    await this.setMatch(token);
  }

  async setMatch(token: string) {
    try {
      this._match = await this._matchService.getJoinMatch(token);
      console.log(this._match);
    }
    catch (e: any) {
      console.warn(e);
    }
  }

  async afterInit() {
    this._matchEngineComponent?.afterInit();
  }

  async refresh() {
    const token = this.router?.currentPath.params["token"] as string;
    this._matchEngineComponent?.refresh(token);
  }

  async destroy(): Promise<void> {
    this._matchEngineComponent?.destroy();
    super.destroy();
  }
}

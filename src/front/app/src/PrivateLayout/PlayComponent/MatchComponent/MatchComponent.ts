import AmethComponent from "../../../framework/AmethComponent";
import type { Router } from "../../../framework/Router/Router";
import MatchEngineComponent from "./MatchEngineComponent/MatchEngineComponent";

export default class MatchComponent extends AmethComponent {
  template = () => import("./MatchComponent.html?raw");
  private _matchEngineComponent?: MatchEngineComponent;

  constructor() {
    super();
  }

  async init(selector: string, router?: Router): Promise<void> {
    await super.init(selector, router);
    this._matchEngineComponent = new MatchEngineComponent(this.router?.currentPath.params["token"] as string);
  }

  async afterInit() {
    await this._matchEngineComponent?.init("matchEngineContainer", this.router);
    this._matchEngineComponent?.afterInit();
  }

  async refresh() {
    this._matchEngineComponent?.refresh(this.router?.currentPath.params["token"] as string);
  }

  async destroy(): Promise<void> {
    this._matchEngineComponent?.destroy();
    super.destroy();
  }
}

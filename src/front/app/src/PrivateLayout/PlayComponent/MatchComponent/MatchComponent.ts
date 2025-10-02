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

    const token = this.router?.currentPath.params["token"] as string;
    this._matchEngineComponent = new MatchEngineComponent(token);
  }

  async afterInit() {
    await this._matchEngineComponent?.init("matchEngineContainer", this.router);
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

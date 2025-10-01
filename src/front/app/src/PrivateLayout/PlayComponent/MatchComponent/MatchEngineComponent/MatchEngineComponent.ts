import AmethComponent from "../../../../framework/AmethComponent";
import type { Router } from "../../../../framework/Router/Router";

export default class MatchEngineComponent extends AmethComponent {
  template = () => import("./MatchEngineComponent.html?raw");
  private _token?: string;

  constructor(token?: string) {
    super();
    this._token = token;
  }

  async init(selector: string, router?: Router): Promise<void> {
    await super.init(selector, router);
  }

  afterInit() {
    this.outlet!.innerHTML = this._token as string;
  }

  async refresh(token?: string) {
    this._token = token;
    this.outlet!.innerHTML = this._token as string;
  }

  async destroy(): Promise<void> {
    super.destroy();
  }
}

import AmethComponent from "../../framework/AmethComponent";
import { TabsHelper } from "../../framework/Tabs/TabsHelper";

export default class PlayComponent extends AmethComponent {
  template = () => import("./PlayComponent.html?raw");
  private _tabs: HTMLElement | null;

  constructor() {
    super();
    this._tabs = null;
  }

  afterInit() {
    this._tabs = document.getElementById("PlayComponentTabs");
    this._checkTabs();
  }

  async refresh() {
    this._checkTabs();
  }

  _checkTabs() {
    if (this._tabs)
      TabsHelper.checkTabs(this._tabs, this.router?.currentPath.fullPath);
  }
}

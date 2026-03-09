import AmethComponent from "../../framework/AmethComponent";
import { TabsHelper } from "../../framework/Tabs/TabsHelper";
import ContextBarComponent from "../ContextBarComponent/ContextBarComponent";

export default class FriendsComponent extends AmethComponent {
  template = () => import("./FriendsComponent.html?raw");
  private _tabsContainer!: HTMLElement;
  private contextBarComponent!: ContextBarComponent;

  constructor() {
    super();
  }

  async afterInit() {
    this._tabsContainer = document.getElementById("FriendsComponentTabs")!;
    TabsHelper.checkTabs(this._tabsContainer, this.router?.currentPath.fullPath);
    this.contextBarComponent = new ContextBarComponent();
    await this.contextBarComponent.init("ContextSearchBar", this.router);
    this.contextBarComponent.afterInit();
  }

  async refresh() {
    TabsHelper.checkTabs(this._tabsContainer, this.router?.currentPath.fullPath);
    this.contextBarComponent.refresh();
  }

  async destroy() {
    await this.contextBarComponent.destroy();
    await super.destroy();
  }
}

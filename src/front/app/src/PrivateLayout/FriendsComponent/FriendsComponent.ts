import { LoggedUser } from "../../auth/LoggedUser";
import AmethComponent from "../../framework/AmethComponent";
import { TabsHelper } from "../../framework/Tabs/TabsHelper";

export default class FriendsComponent extends AmethComponent {
  template = () => import("./FriendsComponent.html?raw");
  private _tabsContainer!: HTMLElement;

  constructor() {
    super();
  }

  afterInit() {
    this._tabsContainer = document.getElementById("FriendsComponentTabs")!;
    this.refresh();
  }

  async refresh() {
    document.getElementById("userGame")!.innerText = (await LoggedUser.get())?.id?.toString() || "NONE";
    console.log(this._tabsContainer, this.router?.currentPath.routePath);
    TabsHelper.checkTabs(this._tabsContainer, this.router?.currentPath.fullPath);
  }
}

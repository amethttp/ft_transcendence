import { LoggedUser } from "../../../auth/LoggedUser";
import AmethComponent from "../../../framework/AmethComponent";
import { TabsHelper } from "../../../framework/Tabs/TabsHelper";



export default class AccessLayout extends AmethComponent {
  template = () => import("./AccessLayout.html?raw");
  private tabsContainer!: HTMLDivElement;

  afterInit() {
    this.tabsContainer = document.getElementById("accessTabs")! as HTMLDivElement;
    this.refresh();
  }

  async refresh() {
    const loggedUser = await LoggedUser.get();
    if (loggedUser !== null)
      this.router?.redirectByPath('/home');
    else
      TabsHelper.checkTabs(this.tabsContainer, this.router?.currentPath.routePath)
  }
}

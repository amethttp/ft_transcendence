import type UserProfile from "../../PrivateLayout/UserComponent/UserProfileComponent/models/UserProfile";
import { LoggedUser } from "../../auth/LoggedUser";
import AmethComponent from "../../framework/AmethComponent";


export default class AccessLayout extends AmethComponent {
  template = () => import("./AccessLayout.html?raw");
  private tabsContainer!: HTMLDivElement;

  afterInit() {
    this.tabsContainer = document.getElementById("accessTabs")! as HTMLDivElement;
    this.refresh();
  }

  async refresh() {
    const loggedUser: UserProfile | null = await LoggedUser.get();
    if (loggedUser !== null)
      this.router?.redirectByPath('/home');
    this.checkTabs(this.tabsContainer, this.router?.currentPath.routePath)
  }

  checkTabs(container: HTMLElement, path: string = "") {
    const tabs = container.children;
    const url = new URL(path, location.origin);
    for (const tab of ([...tabs] as HTMLAnchorElement[])) {
      if (url.toString() == tab.href)
        tab.classList.add("active");
      else
        tab.classList.remove("active");
    }
  }
}

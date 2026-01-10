import { LoggedUser } from "../../../auth/LoggedUser";
import { AuthService } from "../../../auth/services/AuthService";
import AmethComponent from "../../../framework/AmethComponent";
import { TabsHelper } from "../../../framework/Tabs/TabsHelper";

export default class AccessLayout extends AmethComponent {
  template = () => import("./AccessLayout.html?raw");
  private tabsContainer!: HTMLDivElement;
  private googleSignInButton!: HTMLButtonElement;
  private authService!: AuthService;

  afterInit() {
    this.authService = new AuthService();
    this.tabsContainer = document.getElementById("accessTabs")! as HTMLDivElement;
    this.googleSignInButton = document.getElementById("googleSignInButton")! as HTMLButtonElement;
    this.googleSignInButton.addEventListener("click", () => { this.redirectToGoogleAuthUrl(); });
    this.refresh();
  }

  private async redirectToGoogleAuthUrl() {
    const response = await this.authService.getGoogleAuthUrl();
    window.location.href = response.url;
  }

  async refresh() {
    const loggedUser = await LoggedUser.get();
    if (loggedUser !== null)
      this.router?.redirectByPath('/home');
    else
      TabsHelper.checkTabs(this.tabsContainer, this.router?.currentPath.routePath)
  }

  async destroy() {
    this.googleSignInButton.removeEventListener("click", () => { this.redirectToGoogleAuthUrl(); });
  }
}

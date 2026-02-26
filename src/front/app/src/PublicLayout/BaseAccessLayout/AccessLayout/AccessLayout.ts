import { AuthService } from "../../../auth/services/AuthService";
import AmethComponent from "../../../framework/AmethComponent";
import { TabsHelper } from "../../../framework/Tabs/TabsHelper";
import { validateRedirectUrl } from "../../../utils/RedirectValidator";

export default class AccessLayout extends AmethComponent {
  template = () => import("./AccessLayout.html?raw");
  private tabsContainer!: HTMLDivElement;
  private loginTab!: HTMLAnchorElement;
  private registerTab!: HTMLAnchorElement;
  private googleSignInButton!: HTMLButtonElement;
  private authService!: AuthService;
  private googleSignInHandler!: () => void;

  afterInit() {
    this.authService = new AuthService();
    this.tabsContainer = document.getElementById("accessTabs")! as HTMLDivElement;
    this.loginTab = document.getElementById("loginTab")! as HTMLAnchorElement;
    this.registerTab = document.getElementById("registerTab")! as HTMLAnchorElement;
    this.propagateRedirectParam();
    this.googleSignInButton = document.getElementById("googleSignInButton")! as HTMLButtonElement;
    this.googleSignInHandler = () => { this.redirectToGoogleAuthUrl(); };
    this.googleSignInButton.addEventListener("click", this.googleSignInHandler);
    this.refresh();
  }

  private propagateRedirectParam() {
    const params = new URLSearchParams(location.search);
    const redirectParam = params.get("redirect");
    const validatedRedirect = validateRedirectUrl(redirectParam, "");

    const redirectQuery = validatedRedirect
      ? `?redirect=${encodeURIComponent(validatedRedirect)}`
      : "";

    this.loginTab.href = `/login${redirectQuery}`;
    this.registerTab.href = `/register${redirectQuery}`;
  }

  private async redirectToGoogleAuthUrl() {
    const response = await this.authService.getGoogleAuthUrl();
    window.location.href = response.url;
  }

  async refresh() {
    TabsHelper.checkTabs(this.tabsContainer, this.router?.currentPath.routePath)
  }

  async destroy() {
    this.googleSignInButton?.removeEventListener("click", this.googleSignInHandler);
    await super.destroy();
  }
}

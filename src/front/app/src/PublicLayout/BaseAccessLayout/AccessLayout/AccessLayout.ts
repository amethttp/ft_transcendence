import { LoggedUser } from "../../../auth/LoggedUser";
import { AuthService } from "../../../auth/services/AuthService";
import Alert from "../../../framework/Alert/Alert";
import AmethComponent from "../../../framework/AmethComponent";
import { TabsHelper } from "../../../framework/Tabs/TabsHelper";

export default class AccessLayout extends AmethComponent {
  template = () => import("./AccessLayout.html?raw");
  private tabsContainer!: HTMLDivElement;
  private _authService!: AuthService;

  afterInit() {
    this._authService = new AuthService();
    this.tabsContainer = document.getElementById("accessTabs")! as HTMLDivElement;
    this.initGoogleSignIn();
    this.refresh();
  }

  async refresh() {
    const loggedUser = await LoggedUser.get();
    if (loggedUser !== null)
      this.router?.redirectByPath('/home');
    else
      TabsHelper.checkTabs(this.tabsContainer, this.router?.currentPath.routePath)
  }

  private initGoogleSignIn(): void {
    const scriptId = 'google-identity-script';
    const script = document.createElement('script');
    script.id = scriptId;
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => { this.onLoadGoogleScript(); };
    this.outlet?.appendChild(script);
  }

  private onLoadGoogleScript() {
    try {
      (window as any).google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: (resp: any) => this.onGoogleResponse(resp),
      });
      const googleSignInContainer = document.getElementById('googleSignInContainer');
      (window as any).google.accounts.id.renderButton(googleSignInContainer, { theme: 'outline', size: 'large' });
    } catch (e) {
      Alert.error('Something went wrong', 'Please try again later.');
    }
  }

  private onGoogleResponse(response: any) {
    if (!response || !response.credential) {
      return Alert.error('Something went wrong', 'Please try again later.');
    }

    this._authService.authenticateWithGoogle(response.credential)
      .then(() => {
        this.router?.redirectByPath('/home');
      })
      .catch(() => {
        Alert.error('Google authentication failed');
      });
  }
}

import { AuthService } from "../auth/services/AuthService";
import Alert from "../framework/Alert/Alert";
import AmethComponent from "../framework/AmethComponent";

export default class OAuthCallbackComponent extends AmethComponent {
  template = () => import("./OAuthCallbackComponent.html?raw");
  private authService: AuthService;

  constructor() {
    super();
    this.authService = new AuthService();
  }

  async afterInit() {
    const code = new URLSearchParams(window.location.search).get("code");
    if (!code) {
      Alert.error("Failed to sign in with Google", "Please try again later.");
      return this.router?.redirectByPath("/login");
    }

    const userId = await this.authService.authenticateWithGoogle(code);
    sessionStorage.setItem("userId", userId.id.toString());

    this.router?.redirectByPath("/home");
  }
}

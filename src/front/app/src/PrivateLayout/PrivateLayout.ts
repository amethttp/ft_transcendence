import { AuthService } from "../auth/services/AuthService";
import AmethComponent from "../framework/AmethComponent";

export default class PrivateLayout extends AmethComponent {
  private authService: AuthService;

  constructor() {
    super();
    this.template = () => import("./PrivateLayout.html?raw");
    this.authService = new AuthService();
  }

  afterInit(): void {
    document.getElementById("logoutButton")!.onclick = async () => {
      await this.authService.logout();
      this.router?.refresh();
    };
  }
}

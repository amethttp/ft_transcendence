import { AuthService } from "../auth/services/AuthService";
import AmethComponent from "../framework/AmethComponent";

export default class PublicLayout extends AmethComponent {
  template = () => import("./PublicLayout.html?raw");
  
  private authService!: AuthService;
  constructor() {
    super();
  }
  
  afterInit() {
    this.authService = new AuthService();
    document.getElementById("loginButton")?.addEventListener("click", this.login.bind(this));
  }

  async login() {
    await this.authService.login({username: "arcanava", password: ""});
    this.router?.refresh();
  }
}

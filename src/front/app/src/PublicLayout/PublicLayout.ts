import { AuthService } from "../auth/services/AuthService";
import AmethComponent from "../framework/AmethComponent";
import FooterComponent from "./FooterComponent/FooterComponent";

export default class PublicLayout extends AmethComponent {
  template = () => import("./PublicLayout.html?raw");
  
  private authService!: AuthService;
  constructor() {
    super();
  }
  
  afterInit() {
    this.authService = new AuthService();
    document.getElementById("loginButton")?.addEventListener("click", this.login.bind(this));
    const footer = new FooterComponent();
    footer.init("footer");
  }

  async login() {
    await this.authService.login({username: "arcanava", password: ""});
    this.router?.refresh();
  }
}

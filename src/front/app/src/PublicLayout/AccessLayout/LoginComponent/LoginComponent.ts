import { LoggedUser } from "../../../auth/LoggedUser";
import { AuthService } from "../../../auth/services/AuthService";
import AmethComponent from "../../../framework/AmethComponent";

export default class LoginComponent extends AmethComponent {
  template = () => import("./LoginComponent.html?raw");
  private authService!: AuthService;
  private form!: HTMLFormElement;
  private errorView!: HTMLElement;

  afterInit() {
    this.authService = new AuthService();
    this.form = document.getElementById("loginForm")! as HTMLFormElement;
    this.errorView = document.getElementById("loginError")!;
    this.form.onsubmit = e => {
      e.preventDefault();
      this.errorView.classList.add("invisible");
      this.authService.login({ identifier: (this.form[0] as HTMLInputElement).value, password: (this.form[1] as HTMLInputElement).value })
        .then(async () => {
          await LoggedUser.get(true);
          this.router?.redirectByPath("/home");
        })
        .catch(() => this.errorView.classList.remove("invisible"));
    };
  }
}

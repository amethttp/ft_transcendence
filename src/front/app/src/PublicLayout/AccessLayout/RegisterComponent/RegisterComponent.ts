import { LoggedUser } from "../../../auth/LoggedUser";
import type { RegisterRequest } from "../../../auth/models/RegisterRequest";
import { AuthService } from "../../../auth/services/AuthService";
import AmethComponent from "../../../framework/AmethComponent";

export default class RegisterComponent extends AmethComponent {
  template = () => import("./RegisterComponent.html?raw");
  private authService!: AuthService;
  private form!: HTMLFormElement;
  private errorView!: HTMLElement;

  afterInit() {
    this.authService = new AuthService();
    this.form = document.getElementById("registerForm")! as HTMLFormElement;
    this.errorView = document.getElementById("registerError")!;
    this.form.onsubmit = e => {
      e.preventDefault();
      this.errorView.classList.add("invisible");
      const registerRequest: RegisterRequest = {
        username: (this.form[0] as HTMLInputElement).value,
        email: (this.form[1] as HTMLInputElement).value,
        password: (this.form[2] as HTMLInputElement).value
      }
      this.authService.register(registerRequest)
        .then(async () => {
          await LoggedUser.get(true);
          this.router?.navigateByPath("/home");
        })
        .catch(() => this.errorView.classList.remove("invisible"));
    };
  }
}

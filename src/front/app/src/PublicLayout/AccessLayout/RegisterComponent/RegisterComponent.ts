import { LoggedUser } from "../../../auth/LoggedUser";
import type { RegisterRequest } from "../../../auth/models/RegisterRequest";
import { AuthService } from "../../../auth/services/AuthService";
import AmethComponent from "../../../framework/AmethComponent";
import { Form } from "../../../framework/Form/Form";
import { FormControl } from "../../../framework/Form/FormGroup/FormControl/FormControl";
import { Validators } from "../../../framework/Form/FormGroup/FormControl/Validators/Validators";

export default class RegisterComponent extends AmethComponent {
  template = () => import("./RegisterComponent.html?raw");
  private authService!: AuthService;
  private form!: HTMLFormElement;
  private errorView!: HTMLElement;

  afterInit() {
    this.authService = new AuthService();
    this.form = document.getElementById("registerForm")! as HTMLFormElement;
    this.errorView = document.getElementById("registerError")!;

    const form = new Form("registerForm", {
      username: new FormControl(""),
      email: new FormControl("", [Validators.email]),
      password: new FormControl(""),
      repeatPassword: new FormControl(""),
      terms: new FormControl<boolean>(false, [Validators.requiredTrue])
    });

    form.submit = (val: RegisterRequest) => {
      console.log("SUBMITED", val);
    }

    this.form.onsubmit = e => {
      e.preventDefault();
      console.log("FORM:", form);
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

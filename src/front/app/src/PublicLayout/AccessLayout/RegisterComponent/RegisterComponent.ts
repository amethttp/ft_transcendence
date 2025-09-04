import { LoggedUser } from "../../../auth/LoggedUser";
import type { RegisterRequest } from "../../../auth/models/RegisterRequest";
import { AuthService } from "../../../auth/services/AuthService";
import AmethComponent from "../../../framework/AmethComponent";
import { Form } from "../../../framework/Form/Form";
import { FormControl } from "../../../framework/Form/FormGroup/FormControl/FormControl";
import { Validators, type ValidatorFn } from "../../../framework/Form/FormGroup/FormControl/Validators/Validators";
import { RegisterValidators } from "./RegisterValidators/RegisterValidators";
import type { RegisterForm } from "./models/RegisterForm";



export default class RegisterComponent extends AmethComponent {
  template = () => import("./RegisterComponent.html?raw");
  private authService!: AuthService;
  private form!: Form<RegisterForm>;
  private errorView!: HTMLElement;

  afterInit() {
    this.authService = new AuthService();
    this.errorView = document.getElementById("registerError")!;

    const passwdControl = new FormControl<string>("", [Validators.password]);
    const passwordRepeat: ValidatorFn<string> = (value: string) => {
      return passwdControl.value === value ? null : "Passwords do not match";
    };

    this.form = new Form("registerForm", {
      username: new FormControl<string>("", [Validators.username, RegisterValidators.usernameUnique]),
      email: new FormControl<string>("", [Validators.email, RegisterValidators.emailUnique]),
      password: passwdControl,
      repeatPassword: new FormControl<string>("", [passwordRepeat]),
      terms: new FormControl<boolean>(false, [Validators.requiredTrue])
    });

    this.form.submit = (val: RegisterForm) => {
      this.errorView.classList.add("invisible");
      const registerRequest: RegisterRequest = {
        username: val.username,
        email: val.email,
        password: val.password
      }
      this.authService.register(registerRequest)
        .then(async () => {
          await LoggedUser.get(true);
          this.router?.navigateByPath("/home");
        })
        .catch(this.registrationError.bind(this));
    }
  }

  private async registrationError() {
    this.errorView.classList.remove("invisible");
    await this.form.validate();
  }
}

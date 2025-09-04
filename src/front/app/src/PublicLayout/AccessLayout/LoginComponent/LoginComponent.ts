import { LoggedUser } from "../../../auth/LoggedUser";
import type { LoginRequest } from "../../../auth/models/LoginRequest";
import { AuthService } from "../../../auth/services/AuthService";
import AmethComponent from "../../../framework/AmethComponent";
import { Form } from "../../../framework/Form/Form";
import { FormControl } from "../../../framework/Form/FormGroup/FormControl/FormControl";
import { Validators } from "../../../framework/Form/FormGroup/FormControl/Validators/Validators";
import { LoginValidators } from "./LoginValidators/LoginValidators";

export default class LoginComponent extends AmethComponent {
  template = () => import("./LoginComponent.html?raw");
  private _authService!: AuthService;
  private _form!: Form<LoginRequest>;
  private _errorView!: HTMLElement;

  afterInit() {
    this._authService = new AuthService();
    this._form = new Form("loginForm", {
      identifier: new FormControl<string>("", [LoginValidators.identifier]),
      password: new FormControl<string>("", [Validators.password])
    });
    this._errorView = document.getElementById("loginError")!;
    this._form.submit = (value) => {
      this._errorView.classList.add("invisible");
      this._authService.login(value)
        .then(async () => {
          await LoggedUser.get(true);
          this.router?.redirectByPath("/home");
        })
        .catch(() => this._errorView.classList.remove("invisible"));
    };
  }
}

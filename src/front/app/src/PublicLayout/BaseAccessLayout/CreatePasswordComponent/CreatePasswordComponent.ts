import { AuthService } from "../../../auth/services/AuthService";
import AmethComponent from "../../../framework/AmethComponent";
import { Form } from "../../../framework/Form/Form";
import { FormControl } from "../../../framework/Form/FormGroup/FormControl/FormControl";
import { Validators } from "../../../framework/Form/FormGroup/FormControl/Validators/Validators";

export default class CreatePasswordComponent extends AmethComponent {
  template = () => import("./CreatePasswordComponent.html?raw");
  private _authService!: AuthService;
  private _form!: Form<{ username: string, password: string, passwordRepeat: string }>;
  private _errorView!: HTMLElement;

  async afterInit() {
    this._authService = new AuthService();
    const passwdControl = new FormControl<string>("", [Validators.password]);
    this._form = new Form("createPasswordForm", {
      username: new FormControl<string>(this.resolverData.username || ""),
      password: passwdControl,
      passwordRepeat: new FormControl<string>("", [Validators.passwordRepeat(passwdControl)]),
    });
    this._errorView = document.getElementById("createPasswordError")!;
    this._form.submit = (value) => {
      this._errorView.classList.add("invisible");
      this._authService.createPassword({ password: value.password }, this.resolverData.token || "")
        .then(async () => {
          this.router?.redirectByPath("/login");
        })
        .catch(() => this._errorView.classList.remove("invisible"));
    };
  }
}

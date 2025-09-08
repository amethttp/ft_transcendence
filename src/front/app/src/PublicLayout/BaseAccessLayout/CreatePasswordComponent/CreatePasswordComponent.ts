import { AuthService } from "../../../auth/services/AuthService";
import AmethComponent from "../../../framework/AmethComponent";
import { Form } from "../../../framework/Form/Form";
import { FormControl } from "../../../framework/Form/FormGroup/FormControl/FormControl";
import { Validators } from "../../../framework/Form/FormGroup/FormControl/Validators/Validators";

export default class CreatePasswordComponent extends AmethComponent {
  template = () => import("./CreatePasswordComponent.html?raw");
  private _authService!: AuthService;
  private _form!: Form<{ password: string, passwordRepeat: string }>;
  private _errorView!: HTMLElement;
  private _token?: string;

  afterInit() {
    this._authService = new AuthService();
    this.refresh();
    const passwdControl = new FormControl<string>("", [Validators.password]);
    this._form = new Form("createPasswordForm", {
      password: passwdControl,
      passwordRepeat: new FormControl<string>("", [Validators.passwordRepeat(passwdControl)]),
    });
    this._errorView = document.getElementById("createPasswordError")!;
    this._form.submit = (value) => {
      this._errorView.classList.add("invisible");
      console.log(value);
      this._authService.createPassword({ password: value.password }, this._token || "")
        .then(async () => {
          alert("Check your email inbox.");
        })
        .catch(() => this._errorView.classList.remove("invisible"));
    };
  }

  refresh() {
    const token = this.router?.currentPath.params["token"];
    if (token) {
      this._token = token.toString();
      this._authService.checkCreatePassword(this._token)
        .then(async () => {
          // TODO: Put username info hidden on form to help browser
        })
        .catch(() => this.invalidToken());
    }
    else
      this.invalidToken();
  }

  private invalidToken() {
    alert("Invalid token, please re-submit forgot password.");
    // this.router?.redirectByPath("/recover");
  }
}

import type UserProfile from "../../../PrivateLayout/UserComponent/UserProfileComponent/models/UserProfile";
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
  private _token?: string;
  private _user?: UserProfile;

  async afterInit() {
    this._authService = new AuthService();
    await this.refresh();
    const passwdControl = new FormControl<string>("", [Validators.password]);
    this._form = new Form("createPasswordForm", {
      username: new FormControl<string>(this._user?.username || ""),
      password: passwdControl,
      passwordRepeat: new FormControl<string>("", [Validators.passwordRepeat(passwdControl)]),
    });
    this._errorView = document.getElementById("createPasswordError")!;
    this._form.submit = (value) => {
      this._errorView.classList.add("invisible");
      console.log(value);
      this._authService.createPassword({ password: value.password }, this._token || "")
        .then(async () => {
          this.router?.redirectByPath("/login");
        })
        .catch(() => this._errorView.classList.remove("invisible"));
    };
  }

  async refresh() {
    const token = this.router?.currentPath.params["token"];
    if (token) {
      this._token = token.toString();
      try {
        this._user = await this._authService.checkCreatePassword(this._token);
      }
      catch (e) { this.invalidToken() };
    }
    else
      this.invalidToken();
  }

  private invalidToken() {
    alert("Invalid token, please re-submit forgot password.");
    this.router?.redirectByPath("/recover");
  }
}

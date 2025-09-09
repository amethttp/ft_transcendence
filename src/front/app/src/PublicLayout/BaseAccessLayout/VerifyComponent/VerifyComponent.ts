import { LoggedUser } from "../../../auth/LoggedUser";
import { AuthService } from "../../../auth/services/AuthService";
import AmethComponent from "../../../framework/AmethComponent";
import { Form } from "../../../framework/Form/Form";
import { FormControl } from "../../../framework/Form/FormGroup/FormControl/FormControl";
import { Validators } from "../../../framework/Form/FormGroup/FormControl/Validators/Validators";

export default class VerifyComponent extends AmethComponent {
  template = () => import("./VerifyComponent.html?raw");
  private _authService!: AuthService;
  private _form!: Form<{ code: string }>;
  private _errorView!: HTMLElement;
  private _userId?: number;

  afterInit() {
    this._authService = new AuthService();
    this.refresh();
    if (!this._userId) {
      this.router?.redirectByPath("/login");
      return;
    }
    this._form = new Form("verifyForm", {
      code: new FormControl<string>("", [Validators.length(6, 6)])
    });
    this._errorView = document.getElementById("verifyError")!;
    this._form.submit = (value) => {
      this._errorView.classList.add("invisible");
      this._authService.verify({ code: parseInt(value.code), userId: this._userId! })
        .then(async () => {
          const user = await LoggedUser.get(true);
          if (user) {
            sessionStorage.removeItem("userId");
            this.router?.redirectByPath("/home");
          }
        })
        .catch(() => this._errorView.classList.remove("invisible"));
    };
  }

  refresh() {
    const userId = sessionStorage.getItem("userId");
    if (userId)
      this._userId = parseInt(userId);
  }
}

import { LoggedUser } from "../../../auth/LoggedUser";
import { AuthService } from "../../../auth/services/AuthService";
import AmethComponent from "../../../framework/AmethComponent";
import { Form } from "../../../framework/Form/Form";
import { FormControl } from "../../../framework/Form/FormGroup/FormControl/FormControl";
import { Validators } from "../../../framework/Form/FormGroup/FormControl/Validators/Validators";

export default class VerifyComponent extends AmethComponent {
  template = () => import("./VerifyComponent.html?raw");
  private _authService!: AuthService;
  private _form!: Form<{code: string}>;
  private _errorView!: HTMLElement;

  afterInit() {
    this._authService = new AuthService();
    this._form = new Form("verifyForm", {
      code: new FormControl<string>("", [Validators.length(4, 4)])
    });
    this._errorView = document.getElementById("verifyError")!;
    this._form.submit = (value) => {
      this._errorView.classList.add("invisible");
      console.log(value);
        this._authService.verify({code: parseInt(value.code), userId: parseInt(sessionStorage.getItem("userId") || "")})
          .then(async () => {
            const user = await LoggedUser.get(true);
            if (user)
              this.router?.redirectByPath("/home");
          })
          .catch(() => this._errorView.classList.remove("invisible"));
    };
  }
}

import { AuthService } from "../../../auth/services/AuthService";
import AmethComponent from "../../../framework/AmethComponent";
import { Form } from "../../../framework/Form/Form";
import { FormControl } from "../../../framework/Form/FormGroup/FormControl/FormControl";
import { Validators } from "../../../framework/Form/FormGroup/FormControl/Validators/Validators";
import { validateRedirectUrl } from "../../../utils/RedirectValidator";

export default class VerifyComponent extends AmethComponent {
  template = () => import("./VerifyComponent.html?raw");
  private _authService!: AuthService;
  private _form!: Form<{ code: string }>;
  private _errorView!: HTMLElement;

  afterInit() {
    this._authService = new AuthService();
    this._form = new Form("verifyForm", {
      code: new FormControl<string>("", [Validators.length(6, 6)])
    });
    this._errorView = document.getElementById("verifyError")!;
    this._form.submit = (value) => {
      this._errorView.classList.add("invisible");
      this._authService.verify({ code: parseInt(value.code), userId: this.resolverData.userId })
        .then(async () => {
          sessionStorage.removeItem("userId");
          const params = new URLSearchParams(location.search);
          const redirectParam = params.get('redirect');
          const validatedRedirect = validateRedirectUrl(redirectParam, "/home");
          this.router?.redirectByPath(validatedRedirect);
        })
        .catch(() => this._errorView.classList.remove("invisible"));
    };
  }
}

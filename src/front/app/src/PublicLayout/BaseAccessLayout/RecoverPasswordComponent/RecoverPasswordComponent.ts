import type { RecoverRequest } from "../../../auth/models/RecoverRequest";
import { AuthService } from "../../../auth/services/AuthService";
import AmethComponent from "../../../framework/AmethComponent";
import { Form } from "../../../framework/Form/Form";
import { FormControl } from "../../../framework/Form/FormGroup/FormControl/FormControl";
import { Validators } from "../../../framework/Form/FormGroup/FormControl/Validators/Validators";

export default class RecoverPasswordComponent extends AmethComponent {
  template = () => import("./RecoverPasswordComponent.html?raw");
  private _authService!: AuthService;
  private _form!: Form<RecoverRequest>;
  private _errorView!: HTMLElement;

  afterInit() {
    this._authService = new AuthService();
    this._form = new Form("recoverForm", {
      email: new FormControl<string>("", [Validators.email])
    });
    this._errorView = document.getElementById("recoverError")!;
    this._form.submit = (value) => {
      this._errorView.classList.add("invisible");
      this._authService.recover(value)
        .then(async () => {
          document.getElementById("emailSpan")!.innerText = value.email;
          document.getElementById("recoverForm")?.classList.add("hidden");
          document.getElementById("successMessage")?.classList.remove("hidden");
        })
        .catch(() => this._errorView.classList.remove("invisible"));
    };
  }
}

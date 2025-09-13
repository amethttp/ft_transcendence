import { LoggedUser } from "../../../auth/LoggedUser";
import type User from "../../../auth/models/User";
import AmethComponent from "../../../framework/AmethComponent";
import { Form } from "../../../framework/Form/Form";
import { FormControl } from "../../../framework/Form/FormGroup/FormControl/FormControl";
import { Validators } from "../../../framework/Form/FormGroup/FormControl/Validators/Validators";
import type { UserEditRequest } from "./models/UserEditRequest";
import { UserEditService } from "./services/UserEditService";
import { UserEditValidators } from "./validators/UserEditValidators";

export default class UserEditComponent extends AmethComponent {
  template = () => import("./UserEditComponent.html?raw");
  private _form!: Form<UserEditRequest>
  private _userEditService: UserEditService;
  private _user!: User;

  constructor() {
    super();
    this._userEditService = new UserEditService();
  }

  async refresh() {
    this._user = (await LoggedUser.get(true))!;
    this._form.controls.username.validators = [Validators.username, UserEditValidators.usernameUnique(this._user.username)];
    this._form.controls.email.validators = [Validators.email, UserEditValidators.emailUnique(this._user.email)];
  }

  async afterInit() {
    this._user = (await LoggedUser.get(true))!;
    (document.getElementById("UserEditImg")! as HTMLImageElement).src = this._user.avatarUrl;
    this._form = new Form("UserEditForm", {
      username: new FormControl<string>(this._user.username, [Validators.username, UserEditValidators.usernameUnique(this._user.username)]),
      email: new FormControl<string>(this._user.email, [Validators.email, UserEditValidators.emailUnique(this._user.email)]),
    });
    this._form.submit = (val) => {
      this._userEditService.editUser(val)
        .then(async res => {
          const user = await LoggedUser.get(true)!;
          this.router?.redirectByPath("/" + user?.username + "/edit");
          alert("response: " + JSON.stringify(res));
        })
        .catch(e => {
          alert("error: " + JSON.stringify(e));
        });
    }
  }
}

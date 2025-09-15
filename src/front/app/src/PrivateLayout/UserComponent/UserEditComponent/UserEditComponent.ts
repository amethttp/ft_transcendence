import { LoggedUser } from "../../../auth/LoggedUser";
import type User from "../../../auth/models/User";
import { AuthService } from "../../../auth/services/AuthService";
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
    this._form.validate();
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

    const avatarInput = document.getElementById("UserEditAvatarInput")! as HTMLInputElement;
    document.getElementById("UserEditAvatarPicker")!.onclick = () => {
      avatarInput.click();
    }

    avatarInput.oninput = () => {
      const file = avatarInput.files?.[0];
      if (!file)
        return;
      if (file.type.startsWith("image/") && file.size <= 10 * 1024 * 1024) {
        const url = URL.createObjectURL(file);
        (document.getElementById("UserEditImg")! as HTMLImageElement).src = url;
        const formData = new FormData();
        formData.append('file', file);
        this._userEditService.uploadAvatar(formData)
          .then(() => {
            alert("Avatar uploaded succesfully");
          })
          .catch(() => {
            alert("Something went wrong, avatar could not be uploaded :(");
          })
          .finally(() => {
            URL.revokeObjectURL(url);
            this.router?.refresh();
          });
      }
      else {
        avatarInput.value = '';
        alert("Not a valid file. Only images up to 10MB are allowed.");
      }
    };

    document.getElementById("UserEditChangePassword")!.onclick = () => {
      const authService = new AuthService();
      authService.recover({ email: this._user.email })
        .then(() => alert("Check your inbox!"))
        .catch(err => alert("Error: " + JSON.stringify(err)));
    }

    // TODO: Do it in the right way!
    const blob = new Blob([JSON.stringify(this._user)], { type: 'application/json' });
    const downloadBtn = (document.getElementById("UserEditDownload")! as HTMLAnchorElement);
    downloadBtn.href = URL.createObjectURL(blob);
    downloadBtn.onclick = () => alert("Downloading amethpong-user.json");
    document.getElementById("UserEditDeleteBtn")!.onclick = () => {
      const challenge = prompt("Are you sure to delete your account? Type \"sure\".");
      if (challenge === "sure") {
        this._userEditService.deleteUser()
          .then(async () => {
            alert("Successfully deleted user");
            this.router?.navigateByPath("/");
          })
          .catch(error => {
            alert("error: " + JSON.stringify(error));
          });
      }
      else if (challenge !== null)
        alert("Failed challenge \"" + challenge + "\" is not \"sure\".");
    }
  }
}

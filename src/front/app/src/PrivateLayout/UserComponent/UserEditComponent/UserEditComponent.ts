import type User from "../../../auth/models/User";
import { AuthService } from "../../../auth/services/AuthService";
import Alert from "../../../framework/Alert/Alert";
import AmethComponent from "../../../framework/AmethComponent";
import { Form } from "../../../framework/Form/Form";
import { FormControl } from "../../../framework/Form/FormGroup/FormControl/FormControl";
import { Validators } from "../../../framework/Form/FormGroup/FormControl/Validators/Validators";
import DateUtils from "../../../utils/DateUtils";
import type { UserEditRequest } from "./models/UserEditRequest";
import { UserEditService } from "./services/UserEditService";
import { UserEditValidators } from "./validators/UserEditValidators";

export default class UserEditComponent extends AmethComponent {
  template = () => import("./UserEditComponent.html?raw");
  private _form!: Form<UserEditRequest>
  private _userEditService: UserEditService;
  private _user!: User;
  private logoutHandler?: (e: Event) => void;

  constructor() {
    super();
    this._userEditService = new UserEditService();
  }

  async refresh() {
    this._user = this.resolverData.user;
    this._form.controls.username.validators = [Validators.username, UserEditValidators.usernameUnique(this._user.username)];
    this._form.controls.email.validators = [Validators.email, UserEditValidators.emailUnique(this._user.email)];
    this._form.controls.birthDate.validators = [Validators.isValidBirthDate];
    this._form.validate();
  }

  async afterInit() {
    DateUtils.setMaxDate('dateInput');
    this._user = this.resolverData.user;
    (document.getElementById("UserEditImg")! as HTMLImageElement).src = this._user.avatarUrl;
    this._form = new Form("UserEditForm", {
      username: new FormControl<string>(this._user.username, [Validators.username, UserEditValidators.usernameUnique(this._user.username)]),
      email: new FormControl<string>(this._user.email, [Validators.email, UserEditValidators.emailUnique(this._user.email)]),
      birthDate: new FormControl<string>(this._user.birthDate, [Validators.isValidBirthDate])
    });
    this._form.submit = (val) => {
      this._userEditService.editUser(val)
        .then(async () => {
          Alert.success("Profile updated successfully");
          this.router?.refresh();
        })
        .catch(() => {
          Alert.error("Could not update profile");
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
            Alert.success("Avatar uploaded succesfully");
          })
          .catch(() => {
            Alert.error("Could not upload avatar");
          })
          .finally(() => {
            URL.revokeObjectURL(url);
            this.router?.refresh();
          });
      }
      else {
        avatarInput.value = '';
        Alert.error("Invalid file", "Only images up to 10MB are allowed.");
      }
    };

    document.getElementById("UserEditChangePassword")!.onclick = () => {
      const authService = new AuthService();
      authService.recover({ email: this._user.email })
        .then(() => Alert.info("Check your inbox", "Follow email instructions to change your password."))
        .catch(() => Alert.error("Could not send change password instructions email"));
    }

    const downloadBtn = (document.getElementById("UserEditDownload")! as HTMLAnchorElement);
    downloadBtn.onclick = () => {
      this._userEditService.requestDownloadData()
        .then(() => Alert.info("Check your inbox", "Follow email instructions to download your data."))
        .catch(() => Alert.error("Could not send data download email"));
    }
    document.getElementById("UserEditDeleteBtn")!.onclick = () => {
      const challenge = prompt("Are you sure to delete your account? Type \"delete\".");
      if (challenge === "delete") {
        this._userEditService.deleteUser()
          .then(async () => {
            Alert.success("Successfully deleted your account");
            this.router?.navigateByPath("/");
          })
          .catch(() => {
            Alert.error("Could not delete your account");
          });
      }
      else if (challenge !== null)
        Alert.error("Failed challenge", "\"" + challenge + "\" is not \"delete\".");
    }

    const authService = new AuthService();
    this.logoutHandler = (e: Event) => {
      e.stopImmediatePropagation();
      e.preventDefault();
      authService.logout().then(async res => {
        if (res.success) {
          this.router?.navigateByPath("/");
        }
      });
    };
    document.getElementById("UserEditLogoutBtn")?.addEventListener("click", this.logoutHandler);
  }

  async destroy() {
    if (this.logoutHandler) {
      document.getElementById("UserEditLogoutBtn")?.removeEventListener("click", this.logoutHandler);
    }
    await super.destroy();
  }
}

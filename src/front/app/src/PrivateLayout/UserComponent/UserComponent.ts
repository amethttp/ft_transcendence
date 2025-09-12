import { LoggedUser } from "../../auth/LoggedUser";
import AmethComponent from "../../framework/AmethComponent";
import { TitleHelper } from "../../framework/TitleHelper/TitleHelper";
import type User from "./UserProfileComponent/models/User";
import UserProfileService from "./UserProfileComponent/services/UserProfileService";

export default class UserComponent extends AmethComponent {
  template = () => import("./UserComponent.html?raw");
  protected userProfileService: UserProfileService;
  protected userProfile?: User;

  constructor() {
    super();
    this.userProfileService = new UserProfileService();
  }

  async afterInit() {
    await this.refresh();
  }

  async refresh() {
    const username = this.router?.currentPath.params["userId"] as string;
    if (!username)
      this.userProfile = await LoggedUser.get() || undefined;
    else {
      try {
        this.userProfile = await this.userProfileService.getUserProfile(username);
      } catch (error) {
        this.router?.redirectByPath("404")
      }
    }
    if (this.userProfile) {
      this.updateTitle();
      this.fillView();
    }
  }

  private fillView() {
    document.getElementById("_userEmail")!.innerText = this.userProfile?.username || "NONE";
  }

  private updateTitle() {
    if (this.userProfile?.username) {
      document.title = TitleHelper.addTitlePart(this.userProfile.username);
    }
  }
}

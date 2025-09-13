import { LoggedUser } from "../../auth/LoggedUser";
import AmethComponent from "../../framework/AmethComponent";
import { TitleHelper } from "../../framework/TitleHelper/TitleHelper";
import UserProfileService from "./services/UserProfileService";
import type UserProfile from "./models/UserProfile";
import UserStatsComponent from "./UserStatsComponent/UserStatsComponent";

export default class UserComponent extends AmethComponent {
  template = () => import("./UserComponent.html?raw");
  protected userProfileService: UserProfileService;
  protected userProfile?: UserProfile;
  protected userName?: string;

  constructor() {
    super();
    this.userProfileService = new UserProfileService();
  }

  async afterInit() {
    this.refresh();
  }

  async refresh() {
    const username = this.router?.currentPath.params["userId"] as string;
    this.userName = (await LoggedUser.get())?.username;
    if (!username)
      this.router?.redirectByPath("404")
    else if (username === this.userName)
      this.userProfile = (await LoggedUser.get(true))! as unknown as UserProfile;
    else {
      try {
        this.userProfile = await this.userProfileService.getUserProfile(username) as unknown as UserProfile;
      } catch (error) {
        this.router?.redirectByPath("404");
      }
    }
    if (this.userProfile) {
      this.updateTitle();
      this.fillView();
    }
    else
      this.router?.redirectByPath("404");
  }

  private async fillView() {
    document.getElementById("UserComponentUsername")!.innerText = this.userProfile!.username;
    document.getElementById("UserComponentCreationTime")!.innerText = new Date(this.userProfile!.creationTime).toDateString();
    if (this.userProfile?.username === this.userName) {
      (document.getElementById("UserComponentEditBtn")! as HTMLAnchorElement).href = `/${this.userProfile!.username}/edit`;
    }
    else {
      if (this.userProfile?.online)
        document.getElementById("UserComponentOnline")!.classList.remove("hidden");
      else
        document.getElementById("UserComponentOffline")!.classList.remove("hidden");
    }
    const userStats = new UserStatsComponent();
    await userStats.init("UserComponentStats", this.router);
    userStats.afterInit();
  }

  private updateTitle() {
    if (this.userProfile?.username) {
      document.title = TitleHelper.addTitlePart(this.userProfile.username);
    }
  }
}

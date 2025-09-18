import { LoggedUser } from "../../auth/LoggedUser";
import AmethComponent from "../../framework/AmethComponent";
import { TitleHelper } from "../../framework/TitleHelper/TitleHelper";
import UserProfileService from "./services/UserProfileService";
import type UserProfile from "./models/UserProfile";
import UserStatsComponent from "./UserStatsComponent/UserStatsComponent";
import { AuthService } from "../../auth/services/AuthService";

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
    this.clearView();
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

  private clearView() {
    for (const action of [...(document.getElementById("userActions")?.getElementsByClassName("btn")!)]) {
      action.classList.add("hidden");
    }
  }

  private fillView() {
    (document.getElementById("userAvatar")! as HTMLImageElement).src = this.userProfile!.avatarUrl;
    document.getElementById("UserComponentUsername")!.innerText = this.userProfile!.username;
    document.getElementById("UserComponentCreationTime")!.innerText = new Date(this.userProfile!.creationTime).toDateString();
    if (this.userProfile?.username === this.userName) {
      const editBtn = (document.getElementById("UserComponentEditBtn")! as HTMLAnchorElement);
      editBtn.href = `/${this.userProfile!.username}/edit`;
      editBtn.classList.remove("hidden");
      const logOutBtn = document.getElementById("UserComponentLogout")!;
      logOutBtn.onclick = this.logOut.bind(this);
      logOutBtn.classList.remove("hidden");
    }
    else {
      this.setOnlineStatus();
      this.setFriendStatus();
    }
    this.initStatsComponent();
  }

  private logOut() {
    const authService = new AuthService();
    authService.logout().then( async () => {
      await LoggedUser.get(true);
      this.router?.redirectByPath("/");
    });
  }

  private setFriendStatus() {
    if (this.userProfile?.friend)
      document.getElementById("UserComponentDeleteFriendBtn")!.classList.remove("hidden");
    else
      document.getElementById("UserComponentAddFriendBtn")!.classList.remove("hidden");
  }

  private setOnlineStatus() {
    if (this.userProfile?.online)
        document.getElementById("UserComponentOnline")!.classList.remove("hidden");
      else
        document.getElementById("UserComponentOffline")!.classList.remove("hidden");
  }

  private async initStatsComponent() {
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

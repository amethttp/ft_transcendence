import { LoggedUser } from "../../auth/LoggedUser";
import AmethComponent from "../../framework/AmethComponent";
import { TitleHelper } from "../../framework/TitleHelper/TitleHelper";
import Sidebar from "../SidebarComponent/SidebarComponent";
import type UserProfile from "./UserProfileComponent/models/UserProfile";
import UserProfileService from "./UserProfileComponent/services/UserProfileService";

export default class UserComponent extends AmethComponent {
  template = () => import("./UserComponent.html?raw");
  protected sidebar: Sidebar;
  protected userProfileService: UserProfileService;
  protected userProfile?: UserProfile;

  constructor() {
    super();
    this.userProfileService = new UserProfileService();
    this.sidebar = new Sidebar();
  }

  async afterInit() {
    this.sidebar.init("user-sidebar");
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

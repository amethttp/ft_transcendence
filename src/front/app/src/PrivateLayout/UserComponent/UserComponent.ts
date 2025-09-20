import { LoggedUser } from "../../auth/LoggedUser";
import AmethComponent from "../../framework/AmethComponent";
import { TitleHelper } from "../../framework/TitleHelper/TitleHelper";
import UserProfileService from "./services/UserProfileService";
import type UserProfile from "./models/UserProfile";
import UserStatsComponent from "./UserStatsComponent/UserStatsComponent";
import RelationService from "./services/RelationService";
import UserProfileComponent from "./UserProfileComponent/UserProfileComponent";

export default class UserComponent extends AmethComponent {
  template = () => import("./UserComponent.html?raw");
  protected userProfileService: UserProfileService;
  protected relationService: RelationService;
  protected userProfile!: UserProfile;
  protected userProfileComponent?: UserProfileComponent;
  protected userName?: string;
  protected userStats?: UserStatsComponent;

  constructor() {
    super();
    this.userProfileService = new UserProfileService();
    this.relationService = new RelationService();
  }

  async setUserProfile() {
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
    }
    else
      this.router?.redirectByPath("404");
  }

  async afterInit() {
    await this.setUserProfile();
    this.userProfileComponent = new UserProfileComponent(this.userProfile);
    await this.userProfileComponent.init('UserComponentProfile', this.router);
    this.userProfileComponent.afterInit();
    this.userStats = new UserStatsComponent();
    await this.userStats.init("UserComponentStats", this.router);
    this.userStats.afterInit();
  }

  async refresh() {
    await this.setUserProfile();
    this.userProfileComponent?.refresh(this.userProfile);
    this.userStats?.refresh();
  }

  private updateTitle() {
    if (this.userProfile?.username) {
      document.title = TitleHelper.addTitlePart(this.userProfile.username);
    }
  }

  async destroy() {
    Promise.all([this.userProfileComponent?.destroy(), this.userStats?.destroy()]);
    this.userProfileComponent = undefined;
    this.userStats = undefined;
  }
}

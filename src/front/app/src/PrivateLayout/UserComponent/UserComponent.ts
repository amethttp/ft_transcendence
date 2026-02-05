import { LoggedUser } from "../../auth/LoggedUser";
import AmethComponent from "../../framework/AmethComponent";
import { TitleHelper } from "../../framework/TitleHelper/TitleHelper";
import UserProfileService from "./services/UserProfileService";
import type UserProfile from "./models/UserProfile";
import UserStatsComponent from "./UserStatsComponent/UserStatsComponent";
import RelationService from "./services/RelationService";
import UserProfileComponent from "./UserProfileComponent/UserProfileComponent";
import UserProfilePageComponent from "./UserProfileComponent/variants/UserProfilePageComponent/UserProfilePageComponent";
import { RelationType } from "./models/Relation";
import { Context } from "../../framework/Context/Context";

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
    if (this.userProfile)
      this.updateTitle();
    else
      this.router?.redirectByPath("404");
  }

  async afterInit() {
    await this.setUserProfile();
    if ((await LoggedUser.get())?.username === this.userProfile.username) {
      this.router?.redirectByPath("/home");
      return;
    }
    this.userProfileComponent = new UserProfilePageComponent(this.userProfile);
    await this.userProfileComponent.init('UserComponentProfile', this.router);
    this.userProfileComponent.afterInit();
    this.userProfileComponent.on("change", async () => {
      await this.setUserProfile();
      this.userProfileComponent?.refresh(this.userProfile);
      if (this.userProfile.relation && (this.userProfile.relation.type === RelationType.BLOCKED || this.userProfile.relation.type === RelationType.NO_RELATION))
        this.refresh();
      Context.friends.get(true);
    });
    this.initStatsComponent();
  }

  private async initStatsComponent() {
    let userProfile;
    if (this.userName !== this.userProfile.username && this.userProfile?.relation.type === RelationType.BLOCKED)
      userProfile = null;
    else
      userProfile = this.userProfile;
    this.userStats = new UserStatsComponent(userProfile || undefined);
    await this.userStats.init("UserComponentStats", this.router);
    await this.userStats.afterInit();
  }

  async refresh() {
    await this.setUserProfile();
    this.userProfileComponent?.refresh(this.userProfile);
    let userProfile;
    if (this.userName !== this.userProfile.username && this.userProfile?.relation.type === RelationType.BLOCKED)
      userProfile = null;
    else
      userProfile = this.userProfile;
    this.userStats?.refresh(userProfile || undefined);
  }

  private updateTitle() {
    if (this.userProfile?.username) {
      document.title = TitleHelper.addTitlePart(this.userProfile.username);
    }
  }

  async destroy() {
    super.destroy();
    await Promise.all([this.userProfileComponent?.destroy(), this.userStats?.destroy()]);
    this.userProfileComponent = undefined;
    this.userStats = undefined;
  }
}

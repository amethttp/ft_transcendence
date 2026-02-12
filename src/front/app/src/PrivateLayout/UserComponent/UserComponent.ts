import { LoggedUser } from "../../auth/LoggedUser";
import AmethComponent from "../../framework/AmethComponent";
import { TitleHelper } from "../../framework/TitleHelper/TitleHelper";
import type UserProfile from "./models/UserProfile";
import UserStatsComponent from "./UserStatsComponent/UserStatsComponent";
import RelationService from "./services/RelationService";
import UserProfileComponent from "./UserProfileComponent/UserProfileComponent";
import UserProfileActionsComponent from "./UserProfileComponent/variants/UserProfileActionsComponent/UserProfileActionsComponent";
import { RelationType } from "./models/Relation";
import { Context } from "../../framework/Context/Context";

export default class UserComponent extends AmethComponent {
  template = () => import("./UserComponent.html?raw");
  protected relationService: RelationService;
  protected userProfile!: UserProfile;
  protected userProfileComponent?: UserProfileComponent;
  protected userName?: string;
  protected userStats?: UserStatsComponent;

  constructor() {
    super();
    this.relationService = new RelationService();
  }

  async setUserProfile() {
    const username = this.router?.currentPath.params["userId"] as string;
    this.userName = (await LoggedUser.get())?.username;
  
    if (username === this.userName)
      this.userProfile = (await LoggedUser.get(true))! as unknown as UserProfile;
    else {
      this.userProfile = this.resolverData.userProfile;
    }
    this.updateTitle();
  }

  async afterInit() {
    await this.setUserProfile();
    this.userProfileComponent = new UserProfileActionsComponent(this.userProfile);
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
    await this.userProfileComponent?.destroy();
    await this.userStats?.destroy();
    this.userProfileComponent = undefined;
    this.userStats = undefined;
    await super.destroy();
  }
}

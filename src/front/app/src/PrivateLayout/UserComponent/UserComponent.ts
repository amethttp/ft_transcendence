import { LoggedUser } from "../../auth/LoggedUser";
import AmethComponent from "../../framework/AmethComponent";
import { TitleHelper } from "../../framework/TitleHelper/TitleHelper";
import type UserProfile from "./models/UserProfile";
import UserStatsComponent from "./UserStatsComponent/UserStatsComponent";
import RelationService from "./services/RelationService";
import UserProfileComponent from "./UserProfileComponent/UserProfileComponent";
import UserProfilePageComponent from "./UserProfileComponent/variants/UserProfilePageComponent/UserProfilePageComponent";
import { RelationType, type TRelationType } from "./models/Relation";
import { Context } from "../../framework/Context/Context";
import Alert from "../../framework/Alert/Alert";
import UserProfileService from "./services/UserProfileService";

export default class UserComponent extends AmethComponent {
  template = () => import("./UserComponent.html?raw");
  protected relationService: RelationService;
  protected userProfile!: UserProfile;
  protected userProfileComponent?: UserProfileComponent;
  protected userName?: string;
  protected userStats?: UserStatsComponent;
  protected _userProfileService: UserProfileService;
  protected _lastRelation: TRelationType;
  protected _prevTitle?: string;

  constructor() {
    super();
    this.relationService = new RelationService();
    this._userProfileService = new UserProfileService();
    this._lastRelation = RelationType.NO_RELATION;
  }

  async setUserProfile() {
    const username = this.router?.currentPath.params["userId"] as string;
    this.userName = (await LoggedUser.get())?.username;

    if (username === this.userName)
      this.userProfile = (await LoggedUser.get(true))! as unknown as UserProfile;
    else {
      const username = this.router?.currentPath.params["userId"] as string;
      try {
        this.userProfile = (await this._userProfileService.getUserProfile(username)) as unknown as UserProfile;
      } catch (error) {
        Alert.error("Error fetching user profile");
        this.userProfile = undefined as unknown as UserProfile;
      }
    }
    this._refreshTitle();
  }

  async afterInit() {
    this.userProfile = this.resolverData.userProfile;
    this._lastRelation = this.userProfile.relation?.type || RelationType.NO_RELATION;
    this.userProfileComponent = new UserProfilePageComponent(this.userProfile);
    await this.userProfileComponent.init('UserComponentProfile', this.router);
    this.userProfileComponent.afterInit();
    this.initStatsComponent();
    this.setTitle();
    this.userProfileComponent.on("change", async () => {
      await this.setUserProfile();
      this.userProfileComponent?.refresh(this.userProfile);
      Context.friends.get(true);
      if (this.userProfile.relation?.type === RelationType.BLOCKED || this._lastRelation === RelationType.BLOCKED)
        this.userStats?.refresh(this.userProfile);
      this._lastRelation = this.userProfile.relation?.type || RelationType.NO_RELATION;
    });
  }

  private async initStatsComponent() {
    this.userStats = new UserStatsComponent(this.userProfile);
    await this.userStats.init("UserComponentStats", this.router);
    await this.userStats.afterInit();
  }

  async refresh() {
    this.userProfile = this.resolverData.userProfile;
    this.userProfileComponent?.refresh(this.userProfile);
    this.userStats?.refresh(this.userProfile);
    this._refreshTitle();
  }

  private _refreshTitle() {
    if (this.userProfile?.username) {
      document.title = TitleHelper.addTitlePart(this.userProfile.username, this._prevTitle);
    }
  }

  private setTitle() {
    if (this.userProfile?.username) {
      this._prevTitle = document.title;
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

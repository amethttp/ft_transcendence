import { LoggedUser } from "../../auth/LoggedUser";
import AmethComponent from "../../framework/AmethComponent";
import UserProfileActionsComponent from "../UserComponent/UserProfileComponent/variants/UserProfileActionsComponent/UserProfileActionsComponent";
import UserStatsComponent from "../UserComponent/UserStatsComponent/UserStatsComponent";
import type UserProfile from "../UserComponent/models/UserProfile";

export default class HomeComponent extends AmethComponent {
  template = () => import("./HomeComponent.html?raw")

  protected userProfile?: UserProfile;
  protected userProfileComponent?: UserProfileActionsComponent;
  protected userStats?: UserStatsComponent;

  constructor() {
    super();
  }

  async afterInit() {
    await this.refresh();
  }

  async refresh() {
    this.userProfile = (await LoggedUser.get(true)) as unknown as UserProfile;
    if (!this.userProfile) return;

    this.userProfileComponent = new UserProfileActionsComponent(this.userProfile);
    await this.userProfileComponent.init("HomeProfile", this.router);
    await this.userProfileComponent.afterInit();
    this.userProfileComponent.hideActions();

    this.userStats = new UserStatsComponent(this.userProfile);
    await this.userStats.init("HomeStats", this.router);
    await this.userStats.afterInit();
  }

  async destroy() {
    super.destroy();
    await Promise.all([this.userProfileComponent?.destroy(), this.userStats?.destroy()]);
    this.userProfileComponent = undefined;
    this.userStats = undefined;
  }
}

import { LoggedUser } from "../../auth/LoggedUser";
import AmethComponent from "../../framework/AmethComponent";
import type UserProfileComponent from "../UserComponent/UserProfileComponent/UserProfileComponent";
import UserProfilePageComponent from "../UserComponent/UserProfileComponent/variants/UserProfilePageComponent/UserProfilePageComponent";
import UserStatsComponent from "../UserComponent/UserStatsComponent/UserStatsComponent";
import type UserProfile from "../UserComponent/models/UserProfile";

export default class HomeComponent extends AmethComponent {
  template = () => import("./HomeComponent.html?raw")

  protected userProfile?: UserProfile;
  protected userProfileComponent?: UserProfileComponent;
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

    this.userProfileComponent = new UserProfilePageComponent(this.userProfile);
    await this.userProfileComponent.init("HomeProfile", this.router);
    await this.userProfileComponent.afterInit();

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

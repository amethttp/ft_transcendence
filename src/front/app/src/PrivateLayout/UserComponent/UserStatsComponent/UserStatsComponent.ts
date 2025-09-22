import AmethComponent from "../../../framework/AmethComponent";
import UserProfileService from "../services/UserProfileService";
import type { UserStats } from "./models/UserStats";


export default class UserStatsComponent extends AmethComponent {
  template = () => import("./UserStatsComponent.html?raw");
  protected userProfileService: UserProfileService;
  protected targetUser: string;

  constructor(targetUser: string) {
    super();
    this.userProfileService = new UserProfileService();
    this.targetUser = targetUser;
  }

  async afterInit() {
    const stats = await this.userProfileService.getUserStats(this.targetUser) as UserStats;
    console.log(stats);
    document.getElementById("userIdw")!.innerHTML = stats.matchWinRate.toString() + "%";
  }

  refresh() {
    this.afterInit();
  }
}

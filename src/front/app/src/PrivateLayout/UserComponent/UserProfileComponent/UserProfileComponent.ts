import AmethComponent from "../../../framework/AmethComponent";
import type UserProfile from "../models/UserProfile";
import UserProfileService from "../services/UserProfileService";

export default class UserProfileComponent extends AmethComponent {
  template = () => import("./UserProfileComponent.html?raw");
  protected userProfileService: UserProfileService;
  protected userProfile?: UserProfile;

  constructor(userProfile: UserProfile) {
    super();
    this.userProfile = userProfile;
    this.userProfileService = new UserProfileService();
  }

  async afterInit() {
    this.refresh();
  }

  async refresh(userProfile?: UserProfile) {
    if (userProfile)
      this.userProfile = userProfile;
    this.clearView();
    this.fillView();
  }

  protected clearView() {
    this.outlet?.getElementsByClassName("UserComponentOnline")[0]!.classList.add("hidden");
    this.outlet?.getElementsByClassName("UserComponentOffline")[0]!.classList.add("hidden");
    (this.outlet?.getElementsByClassName("userAvatar")[0]! as HTMLImageElement).src = "/default-avatar.webp";
  }

  protected fillView() {
    (this.outlet?.getElementsByClassName("userAvatar")[0]! as HTMLImageElement).src = this.userProfile!.avatarUrl;
    (this.outlet!.getElementsByClassName("UserComponentUsername")[0]! as HTMLElement).innerText = this.userProfile!.username;
    const anchor = this.outlet?.getElementsByClassName("UserProfileComponentAnchor")[0] as HTMLAnchorElement;
    if (anchor) {
      anchor.href = `/${this.userProfile?.username}`;
    }
    this.setOnlineStatus();
  }

  private setOnlineStatus() {
    if (this.userProfile?.online)
      this.outlet?.getElementsByClassName("UserComponentOnline")[0]!.classList.remove("hidden");
    else
      this.outlet?.getElementsByClassName("UserComponentOffline")[0]!.classList.remove("hidden");
  }

  async destroy() {
    super.destroy();
  }
}
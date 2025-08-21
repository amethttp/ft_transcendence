import AmethComponent from "../../../framework/AmethComponent";
import type UserProfile from "./models/UserProfile";
import UserProfileService from "./services/UserProfileService";

export default class UserProfileComponent extends AmethComponent {
  template = () => import("./UserProfileComponent.html?raw");
  protected userProfileService: UserProfileService;
  protected userProfile?: UserProfile;

  constructor() {
    super();
    this.userProfileService = new UserProfileService();
  }

  fillView() {
    document.getElementById("userProfile")!.innerHTML = this.userProfile?.email || "NONE";
  }

  afterInit() {
    const username = this.router?.currentPath.params["userId"] as string;
    this.userProfileService.getUserProfile(username).then(val => {
      console.log("USER PROFILE", val);
      this.userProfile = val;
    }).catch(() => {
      this.userProfile = { email: "NOT FOUND" };
    }).finally(() => this.fillView());
  }
}

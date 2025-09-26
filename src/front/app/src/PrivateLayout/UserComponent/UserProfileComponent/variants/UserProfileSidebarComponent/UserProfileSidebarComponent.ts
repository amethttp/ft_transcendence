import type UserProfile from "../../../models/UserProfile";
import UserProfileComponent from "../../UserProfileComponent";

export default class UserProfileSidebarComponent extends UserProfileComponent {
  template = () => import("./UserProfileSidebarComponent.html?raw");

  constructor(userProfile: UserProfile) {
    super(userProfile);
  }

  async afterInit() {
    this.refresh();
  }
}
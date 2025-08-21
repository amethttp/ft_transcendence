import AmethComponent from "../../framework/AmethComponent";
import { TitleHelper } from "../../framework/TitleHelper/TitleHelper";
import Sidebar from "../components/SidebarComponent/SidebarComponent";
import type UserProfile from "./UserProfileComponent/models/UserProfile";
import UserProfileService from "./UserProfileComponent/services/UserProfileService";

export default class UserComponent extends AmethComponent {
  template = () => import("./UserComponent.html?raw");
  protected sidebar: Sidebar;
  protected userProfileService: UserProfileService;
  protected userProfile?: UserProfile;

  constructor() {
    super();
    this.userProfileService = new UserProfileService();
    this.sidebar = new Sidebar();
  }

  afterInit() {
    this.sidebar.init("user-sidebar");
    const username = this.router?.currentPath.params["userId"] as string;
    this.userProfileService.getUserProfile(username).then(val => {
      this.userProfile = val;
      this.updateTitle();
    }).catch(() => {
      this.userProfile = { email: "NOT FOUND" };
    });
  }

  private updateTitle() {
    if (this.userProfile?.username) {
      document.title = TitleHelper.addTitlePart(this.userProfile.username);
    }
  }
}

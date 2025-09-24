import { LoggedUser } from "../../../auth/LoggedUser";
import AmethComponent from "../../../framework/AmethComponent";
import { Relation } from "../models/RelationInfo";
import type UserProfile from "../models/UserProfile";
import UserProfileService from "../services/UserProfileService";

export default class UserProfileComponent extends AmethComponent {
  template = () => import("./UserProfileComponent.html?raw");
  protected userProfileService: UserProfileService;
  protected userProfile?: UserProfile;
  protected userName?: string;

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
    this.userName = (await LoggedUser.get())?.username;
    this.clearView();
    this.fillView();
  }

  protected clearView() {
    this.outlet?.getElementsByClassName("UserComponentOnline")[0]!.classList.add("hidden");
    this.outlet?.getElementsByClassName("UserComponentOffline")[0]!.classList.add("hidden");
    (this.outlet?.getElementsByClassName("userAvatar")[0]! as HTMLImageElement).src = "/default-avatar.webp";
  }

  protected fillData() {
    (this.outlet?.getElementsByClassName("userAvatar")[0]! as HTMLImageElement).src = this.userProfile!.avatarUrl;
    (this.outlet!.getElementsByClassName("UserComponentUsername")[0]! as HTMLElement).innerText = this.userProfile!.username;
    const anchor = this.outlet?.getElementsByClassName("UserProfileComponentAnchor")[0] as HTMLAnchorElement;
    if (anchor) {
      anchor.href = `/${this.userProfile?.username}`;
    }
  }

  protected fillView() {
    this.fillData();
    if (this.userProfile?.username === this.userName)
      this.showMyProfile();
    else
      this.setRelationStatus();
  }

  protected setOnlineStatus() {
    if (this.userProfile?.online)
      this.outlet?.getElementsByClassName("UserComponentOnline")[0]!.classList.remove("hidden");
    else
      this.outlet?.getElementsByClassName("UserComponentOffline")[0]!.classList.remove("hidden");
  }

  protected showMyProfile() {
  }

  private setRelationStatus() {
    switch (this.userProfile?.relation?.type) {
      case Relation.NO_RELATION:
        this.showNoRelation(this.userProfile);
        break;
      case Relation.FRIENDSHIP_ACCEPTED:
        this.showFriend(this.userProfile);
        break;
      case Relation.FRIENDSHIP_REQUESTED:
        this.showRequestedFriend(this.userProfile);
        break;
      case Relation.BLOCKED:
        this.showBlockedUser(this.userProfile);
        break;

      default:
        break;
    }
  }

  protected showNoRelation(_targetUser: UserProfile) { }

  protected showFriend(_targetUser: UserProfile) {
    this.setOnlineStatus();
  }

  protected showRequestedFriend(_targetUser: UserProfile) { }

  protected showBlockedUser(_targetUser: UserProfile) { }

}
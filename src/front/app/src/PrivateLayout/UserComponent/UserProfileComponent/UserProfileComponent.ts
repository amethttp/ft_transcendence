import { LoggedUser } from "../../../auth/LoggedUser";
import AmethComponent from "../../../framework/AmethComponent";
import { UserStatus, type TUserStatus } from "../../models/UserStatus";
import { RelationType } from "../models/Relation";
import type UserProfile from "../models/UserProfile";
import UserProfileService from "../services/UserProfileService";

export default class UserProfileComponent extends AmethComponent {
  template = () => import("./UserProfileComponent.html?raw");
  protected userProfileService: UserProfileService;
  protected _userProfile: UserProfile;
  protected userName?: string;

  constructor(userProfile: UserProfile) {
    super();
    this._userProfile = userProfile;
    this.userProfileService = new UserProfileService();
  }

  get userProfile(): UserProfile {
    return this._userProfile;
  }

  async afterInit() {
    this.refresh();
  }

  async refresh(userProfile?: UserProfile) {
    if (userProfile)
      this._userProfile = userProfile;
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
    (this.outlet?.getElementsByClassName("userAvatar")[0]! as HTMLImageElement).src = this._userProfile!.avatarUrl;
    (this.outlet!.getElementsByClassName("UserComponentUsername")[0]! as HTMLElement).innerText = this._userProfile!.username;
    (this.outlet!.getElementsByClassName("UserComponentUsername")[0]! as HTMLElement).title = this._userProfile!.username;
    const anchor = this.outlet?.getElementsByClassName("UserProfileComponentAnchor")[0] as HTMLAnchorElement;
    if (anchor) {
      anchor.href = `/profile/${this._userProfile?.username}`;
    }
  }

  protected fillView() {
    this.fillData();
    if (this._userProfile?.username === this.userName)
      this.showMyProfile();
    else
      this.setRelationStatus();
  }

  setOnlineStatus(status: TUserStatus) {
    if (status === UserStatus.ONLINE) {
      this.outlet?.getElementsByClassName("UserComponentOnline")[0]!.classList.remove("hidden");
      this.outlet?.getElementsByClassName("UserComponentOffline")[0]!.classList.add("hidden");
    }
    else {
      this.outlet?.getElementsByClassName("UserComponentOffline")[0]!.classList.remove("hidden");
      this.outlet?.getElementsByClassName("UserComponentOnline")[0]!.classList.add("hidden");
    }
  }

  protected showMyProfile() {
  }

  private setRelationStatus() {
    switch (this._userProfile?.relation?.type) {
      case RelationType.NO_RELATION:
        this.showNoRelation(this._userProfile);
        break;
      case RelationType.FRIENDSHIP_ACCEPTED:
        this.showFriend(this._userProfile);
        break;
      case RelationType.FRIENDSHIP_REQUESTED:
        this.showRequestedFriend(this._userProfile);
        break;
      case RelationType.BLOCKED:
        this.showBlockedUser(this._userProfile);
        break;

      default:
        break;
    }
  }

  protected showNoRelation(_targetUser: UserProfile) { }

  protected showFriend(targetUser: UserProfile) {
    this.setOnlineStatus(targetUser.status);
  }

  protected showRequestedFriend(_targetUser: UserProfile) { }

  protected showBlockedUser(_targetUser: UserProfile) { }

  update(newProfile: UserProfile) {
    this.refresh(newProfile);
  }

}

import { LoggedUser } from "../../../auth/LoggedUser";
import AmethComponent from "../../../framework/AmethComponent";
import { Relation } from "../models/RelationInfo";
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
    const anchor = this.outlet?.getElementsByClassName("UserProfileComponentAnchor")[0] as HTMLAnchorElement;
    if (anchor) {
      anchor.href = `/${this._userProfile?.username}`;
    }
  }

  protected fillView() {
    this.fillData();
    if (this._userProfile?.username === this.userName)
      this.showMyProfile();
    else
      this.setRelationStatus();
  }

  protected setOnlineStatus() {
    if (this._userProfile?.online)
      this.outlet?.getElementsByClassName("UserComponentOnline")[0]!.classList.remove("hidden");
    else
      this.outlet?.getElementsByClassName("UserComponentOffline")[0]!.classList.remove("hidden");
  }

  protected showMyProfile() {
  }

  private setRelationStatus() {
    switch (this._userProfile?.relation?.type) {
      case Relation.NO_RELATION:
        this.showNoRelation(this._userProfile);
        break;
      case Relation.FRIENDSHIP_ACCEPTED:
        this.showFriend(this._userProfile);
        break;
      case Relation.FRIENDSHIP_REQUESTED:
        this.showRequestedFriend(this._userProfile);
        break;
      case Relation.BLOCKED:
        this.showBlockedUser(this._userProfile);
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

  // TODO: Update only necessary data maybe
  update(newProfile: UserProfile) {
    this.refresh(newProfile);
  }

  protected updateStatus() {
    this.setOnlineStatus();
  }

}
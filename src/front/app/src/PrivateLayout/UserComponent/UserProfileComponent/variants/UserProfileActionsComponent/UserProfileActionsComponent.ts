import { Context } from "../../../../../framework/Context/Context";
import { timeAgo, timeAgoLargeText } from "../../../../../utils/DateUtils";
import type { FriendsStatus } from "../../../../models/FriendsStatus";
import { RelationType } from "../../../models/Relation";
import type UserProfile from "../../../models/UserProfile";
import RelationService from "../../../services/RelationService";
import UserProfileService from "../../../services/UserProfileService";
import UserProfileComponent from "../../UserProfileComponent";

export default class UserProfileActionsComponent extends UserProfileComponent {
  template = () => import("./UserProfileActionsComponent.html?raw");
  protected userProfileService: UserProfileService;
  protected relationService: RelationService;

  constructor(userProfile: UserProfile) {
    super(userProfile);
    this.userProfileService = new UserProfileService();
    this.relationService = new RelationService();
  }

  protected clearView() {
    super.clearView();
    for (const action of [...(this.outlet!.getElementsByClassName("userActions")[0]!.getElementsByClassName("btn")!)]) {
      action.classList.add("hidden");
    }
  }

  private updateStatus = (statuses: FriendsStatus) => {
    const status = statuses[this.userProfile.username];
    if (status)
      this.setOnlineStatus(status);
  }

  protected fillView() {
    super.fillView();
    Context.friends.on('status', this.updateStatus);
    (this.outlet!.getElementsByClassName("UserComponentCreationTime")[0]! as HTMLElement).innerText = this._getTimeText() ?? "Joined " + timeAgo({ from: this._userProfile!.creationTime, text: timeAgoLargeText });
  }

  protected showMyProfile() {
    super.showMyProfile();
  }

  protected showNoRelation(targetUser: UserProfile) {
    super.showNoRelation(targetUser);
    this.showBlockUser(targetUser.username);
    const addFriendBtn = (this.outlet?.getElementsByClassName("UserComponentAddFriendBtn")[0]! as HTMLButtonElement);
    addFriendBtn.classList.remove("hidden");
    addFriendBtn.onclick = async (e) => {
      e.preventDefault();
      e.stopImmediatePropagation();

      this.relationService.addFriend(targetUser.username)
        .finally(() => this.emit("change", null));
    }
  }

  protected showFriend(targetUser: UserProfile) {
    super.showFriend(targetUser);
    this.showBlockUser(targetUser.username);
    const delFriendBtn = (this.outlet?.getElementsByClassName("UserComponentDeleteFriendBtn")[0]! as HTMLButtonElement);
    delFriendBtn.classList.remove("hidden");
    delFriendBtn.onclick = async (e) => {
      e.preventDefault();
      e.stopImmediatePropagation();
      this.relationService.removeFriend(targetUser.username)
        .finally(() => this.emit("change", null));
    }
  }

  protected showRequestedFriend(targetUser: UserProfile) {
    super.showRequestedFriend(targetUser);
    this.showBlockUser(targetUser.username);
    if (this._userProfile?.relation.owner) {
      return;
    }
    const acceptBtn = this.outlet?.getElementsByClassName("UserComponentAcceptBtn")[0]! as HTMLElement;
    const declineBtn = this.outlet?.getElementsByClassName("UserComponentDeclineBtn")[0]! as HTMLElement;

    acceptBtn.classList.remove("hidden");
    declineBtn.classList.remove("hidden");

    acceptBtn.onclick = async (e) => {
      e.preventDefault();
      e.stopImmediatePropagation();
      this.relationService.acceptRequest(targetUser.username)
        .finally(() => this.emit("change", null));
    };
    declineBtn.onclick = async (e) => {
      e.preventDefault();
      e.stopImmediatePropagation();
      this.relationService.declineRequest(targetUser.username)
        .finally(() => this.emit("change", null));
    };
  }

  private showBlockUser(targetUser: string) {
    const blockBtn = (this.outlet?.getElementsByClassName("UserComponentBlockBtn")[0]! as HTMLButtonElement);
    blockBtn.classList.remove("hidden");
    blockBtn.onclick = async (e) => {
      e.preventDefault();
      e.stopImmediatePropagation();
      this.relationService.blockUser(targetUser)
        .finally(() => this.emit("change", null));
    }
  }

  protected showBlockedUser(targetUser: UserProfile) {
    super.showBlockedUser(targetUser);
    if (!this._userProfile?.relation.owner) {
      return;
    }
    const delFriendBtn = (this.outlet?.getElementsByClassName("UserComponentUnblockBtn")[0]! as HTMLButtonElement);
    delFriendBtn.classList.remove("hidden");
    delFriendBtn.onclick = async (e) => {
      e.preventDefault();
      e.stopImmediatePropagation();
      this.relationService.unblockUser(targetUser.username)
        .finally(() => this.emit("change", null));
    }
  }

  hideActions() {
    this.outlet?.getElementsByClassName('userActions')[0]!.classList.add('hidden');
  }

  private _getTimeText(): string | undefined {
    if (this._userProfile.relation && this._userProfile.relation.updateTime) {
      let prefix = "";
      switch (this._userProfile.relation.type) {
        case RelationType.FRIENDSHIP_REQUESTED:
          prefix = "Requested";
          break;
        case RelationType.BLOCKED:
          prefix = "Blocked";
          break;
        case RelationType.FRIENDSHIP_ACCEPTED:
          prefix = "Friends since";
          break;
      }
      return prefix + " " + timeAgo({ from: this._userProfile.relation.updateTime, text: timeAgoLargeText });
    }
  }

  async destroy() {
    Context.friends.off('status', this.updateStatus);
    super.destroy();
  }
}

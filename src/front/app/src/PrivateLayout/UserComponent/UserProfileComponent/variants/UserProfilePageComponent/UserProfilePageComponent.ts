import { Context } from "../../../../../framework/Context/Context";
import type { FriendsStatus } from "../../../../models/FriendsStatus";
import type UserProfile from "../../../models/UserProfile";
import RelationService from "../../../services/RelationService";
import UserProfileService from "../../../services/UserProfileService";
import UserProfileComponent from "../../UserProfileComponent";

export default class UserProfilePageComponent extends UserProfileComponent {
  template = () => import("./UserProfilePageComponent.html?raw");
  protected userProfileService: UserProfileService;
  protected relationService: RelationService;

  constructor(userProfile: UserProfile) {
    super(userProfile);
    this.userProfileService = new UserProfileService();
    this.relationService = new RelationService();
  }

  async afterInit() {
    super.afterInit();
    this.refresh();
  }

  async refresh(userProfile?: UserProfile) {
    super.refresh(userProfile);
    this.clearView();
    this.fillView();
  }

  protected clearView() {
    super.clearView();
    for (const action of [...(this.outlet!.getElementsByClassName("userActions")[0]!.getElementsByClassName("btn")!)]) {
      action.classList.add("hidden");
    }
    this.outlet?.getElementsByClassName("UserComponentPendingRequest")[0]?.classList.add("hidden");
  }

  private updateStatus = (statuses: FriendsStatus) => {
    const status = statuses[this.userProfile.username];
    if (status)
      this.setOnlineStatus(status);
  }

  protected fillView() {
    super.fillView();
    Context.friends.on('status', this.updateStatus);
    (this.outlet!.getElementsByClassName("UserComponentCreationTime")[0]! as HTMLElement).innerText = new Date(this._userProfile!.creationTime).toDateString();
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
    const pendingRequestEl = this.outlet?.getElementsByClassName("UserComponentPendingRequest")[0]!;
    if (this._userProfile?.relation.owner) {
      pendingRequestEl.innerHTML = `Waiting for acceptance...`;
      pendingRequestEl.classList.remove("hidden");
      return;
    }
    const acceptBtn = this.outlet?.getElementsByClassName("UserComponentAcceptBtn")[0]! as HTMLElement;
    const declineBtn = this.outlet?.getElementsByClassName("UserComponentDeclineBtn")[0]! as HTMLElement;
    pendingRequestEl.innerHTML = `${targetUser.username} sent a friend request!`;

    pendingRequestEl.classList.remove("hidden");
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

  async destroy() {
    Context.friends.off('status', this.updateStatus);
    super.destroy();
  }
}

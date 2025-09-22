import { LoggedUser } from "../../../../../auth/LoggedUser";
import { AuthService } from "../../../../../auth/services/AuthService";
import { Relation } from "../../../models/RelationInfo";
import type UserProfile from "../../../models/UserProfile";
import RelationService from "../../../services/RelationService";
import UserProfileService from "../../../services/UserProfileService";
import UserProfileComponent from "../../UserProfileComponent";

export default class UserProfileActionsComponent extends UserProfileComponent {
  template = () => import("./UserProfileActionsComponent.html?raw");
  protected userProfileService: UserProfileService;
  protected relationService: RelationService;
  protected userName?: string;

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
    this.userName = (await LoggedUser.get())?.username;
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

  protected fillView() {
    super.fillView();

    (this.outlet!.getElementsByClassName("UserComponentCreationTime")[0]! as HTMLElement).innerText = new Date(this.userProfile!.creationTime).toDateString();
    if (this.userProfile?.username === this.userName) {
      const editBtn = (this.outlet?.getElementsByClassName("UserComponentEditBtn")[0]! as HTMLAnchorElement);
      editBtn.href = `/${this.userProfile!.username}/edit`;
      editBtn.classList.remove("hidden");
      const logOutBtn = this.outlet?.getElementsByClassName("UserComponentLogout")[0]! as HTMLElement;
      logOutBtn.onclick = (e) => {
        e.preventDefault();
        e.stopImmediatePropagation();
        this.logOut();
      };
      logOutBtn.classList.remove("hidden");
    }
    else {
      this.setRelationStatus();
    }
  }

  private logOut() {
    const authService = new AuthService();
    authService.logout().then(async () => {
      await LoggedUser.get(true);
      this.router?.redirectByPath("/");
    });
  }

  private showSendFriendRequest(targetUser: string) {
    this.showBlockUser(targetUser);
    const addFriendBtn = (this.outlet?.getElementsByClassName("UserComponentAddFriendBtn")[0]! as HTMLButtonElement);
    addFriendBtn.classList.remove("hidden");
    addFriendBtn.onclick = async (e) => {
      e.preventDefault();
      e.stopImmediatePropagation();

      this.relationService.addFriend(targetUser)
        .finally(() => this.emit("change", null));
    }
  }

  private showRemoveFriend(targetUser: string) {
    this.showBlockUser(targetUser);
    const delFriendBtn = (this.outlet?.getElementsByClassName("UserComponentDeleteFriendBtn")[0]! as HTMLButtonElement);
    delFriendBtn.classList.remove("hidden");
    delFriendBtn.onclick = async (e) => {
      e.preventDefault();
      e.stopImmediatePropagation();
      this.relationService.removeFriend(targetUser)
        .finally(() => this.emit("change", null));
    }
  }

  private showHandleFriendRequest(targetUser: string) { // TODO: Probably this will never show here
    this.showBlockUser(targetUser);
    const pendingRequestEl = this.outlet?.getElementsByClassName("UserComponentPendingRequest")[0]!;
    if (this.userProfile?.relation.owner) {
      this.outlet!.getElementsByClassName("pendingReqText")[0]!.innerHTML = `Waiting for acceptance...`;
      pendingRequestEl.classList.remove("hidden");
      return;
    }
    const acceptBtn = this.outlet?.getElementsByClassName("UserComponentAcceptBtn")[0]! as HTMLElement;
    const declineBtn = this.outlet?.getElementsByClassName("UserComponentDeclineBtn")[0]! as HTMLElement;
    this.outlet!.getElementsByClassName("pendingReqText")![0].innerHTML = `${targetUser} wants to be your friend!`;

    pendingRequestEl.classList.remove("hidden");
    acceptBtn.classList.remove("hidden");
    declineBtn.classList.remove("hidden");

    acceptBtn.onclick = async (e) => {
      e.preventDefault();
      e.stopImmediatePropagation();
      this.relationService.acceptRequest(targetUser)
        .finally(() => this.emit("change", null));
    };
    declineBtn.onclick = async (e) => {
      e.preventDefault();
      e.stopImmediatePropagation();
      this.relationService.declineRequest(targetUser)
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

  private showUnblockUser(targetUser: string) {
    this.outlet?.getElementsByClassName("UserComponentOnline")[0]!.classList.add("hidden");
    this.outlet?.getElementsByClassName("UserComponentOffline")[0]!.classList.remove("hidden"); // TODO: probably back will check this
    if (!this.userProfile?.relation.owner) {
      return;
    }
    const delFriendBtn = (this.outlet?.getElementsByClassName("UserComponentUnblockBtn")[0]! as HTMLButtonElement);
    delFriendBtn.classList.remove("hidden");
    delFriendBtn.onclick = async (e) => {
      e.preventDefault();
      e.stopImmediatePropagation();
      this.relationService.unblockUser(targetUser)
        .finally(() => this.emit("change", null));
    }
  }

  private setRelationStatus() {
    switch (this.userProfile?.relation?.type) {
      case Relation.NO_RELATION:
        this.showSendFriendRequest(this.userProfile.username);
        break;
      case Relation.FRIENDSHIP_ACCEPTED:
        this.showRemoveFriend(this.userProfile.username);
        break;
      case Relation.FRIENDSHIP_REQUESTED:
        this.showHandleFriendRequest(this.userProfile.username);
        break;
      case Relation.BLOCKED:
        this.showUnblockUser(this.userProfile.username);
        break;

      default:
        break;
    }
  }

  async destroy() {
    super.destroy();
  }
}
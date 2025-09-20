import { LoggedUser } from "../../../auth/LoggedUser";
import { AuthService } from "../../../auth/services/AuthService";
import AmethComponent from "../../../framework/AmethComponent";
import { Relation } from "../models/RelationInfo";
import type UserProfile from "../models/UserProfile";
import RelationService from "../services/RelationService";
import UserProfileService from "../services/UserProfileService";

export default class UserProfileComponent extends AmethComponent {
  template = () => import("./UserProfileComponent.html?raw");
  protected userProfileService: UserProfileService;
  protected RelationService: RelationService;
  protected userProfile?: UserProfile;
  protected userName?: string;

  constructor(userProfile: UserProfile) {
    super();
    this.userProfile = userProfile;
    this.userProfileService = new UserProfileService();
    this.RelationService = new RelationService();
  }

  async afterInit() {
    this.refresh();
  }

  async refresh(userProfile?: UserProfile) {
    if (userProfile) {
      this.userProfile = userProfile;
    }
    this.userName = (await LoggedUser.get())?.username;
    this.clearView();
    this.fillView();
  }

  private clearView() {
    for (const action of [...(this.outlet!.getElementsByClassName("userActions")[0]!.getElementsByClassName("btn")!)]) {
      action.classList.add("hidden");
    }
    this.outlet?.getElementsByClassName("UserComponentPendingRequest")[0]?.classList.add("hidden");
    this.outlet?.getElementsByClassName("UserComponentOnline")[0]!.classList.add("hidden");
    this.outlet?.getElementsByClassName("UserComponentOffline")[0]!.classList.add("hidden");
  }

  private fillView() {
    (this.outlet?.getElementsByClassName("userAvatar")[0]! as HTMLImageElement).src = this.userProfile!.avatarUrl;
    (this.outlet!.getElementsByClassName("UserComponentUsername")[0]! as HTMLElement).innerText = this.userProfile!.username;
    (this.outlet!.getElementsByClassName("UserComponentCreationTime")[0]! as HTMLElement).innerText = new Date(this.userProfile!.creationTime).toDateString();
    console.log(this.userProfile?.username, this.userName);
    if (this.userProfile?.username === this.userName) {
      const editBtn = (this.outlet?.getElementsByClassName("UserComponentEditBtn")[0]! as HTMLAnchorElement);
      editBtn.href = `/${this.userProfile!.username}/edit`;
      editBtn.classList.remove("hidden");
      const logOutBtn = this.outlet?.getElementsByClassName("UserComponentLogout")[0]! as HTMLElement;
      logOutBtn.onclick = this.logOut.bind(this);
      logOutBtn.classList.remove("hidden");
    }
    else {
      this.setOnlineStatus();
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

  private sendFriendRequest(targetUser: string) {
    this.blockUser(targetUser);
    const addFriendBtn = (this.outlet?.getElementsByClassName("UserComponentAddFriendBtn")[0]! as HTMLButtonElement);
    addFriendBtn.classList.remove("hidden");
    addFriendBtn.onclick = async () => {
      this.RelationService.addFriend(targetUser)
        .then(() => this.router?.refresh())
        .catch(() => console.log("Something went wrong"));
    }
  }

  private removeFriend(targetUser: string) {
    this.blockUser(targetUser);
    const delFriendBtn = (this.outlet?.getElementsByClassName("UserComponentDeleteFriendBtn")[0]! as HTMLButtonElement);
    delFriendBtn.classList.remove("hidden");
    delFriendBtn.onclick = async () => {
      this.RelationService.removeFriend(targetUser)
        .then(() => this.router?.refresh())
        .catch(() => console.log("Something went wrong"));
    }
  }

  private handleFriendRequest(targetUser: string) { // TODO: Probably this will never show here
    this.blockUser(targetUser);
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

    acceptBtn.onclick = async () => {
      this.RelationService.acceptRequest(targetUser)
        .then(() => this.router?.refresh())
        .catch(() => console.log("Something went wrong"));
    };
    declineBtn.onclick = async () => {
      this.RelationService.declineRequest(targetUser)
        .then(() => this.router?.refresh())
        .catch(() => console.log("Something went wrong"));
    };
  }

  private blockUser(targetUser: string) {
    const blockBtn = (this.outlet?.getElementsByClassName("UserComponentBlockBtn")[0]! as HTMLButtonElement);
    blockBtn.classList.remove("hidden");
    blockBtn.onclick = async () => {
      this.RelationService.blockUser(targetUser)
        .then(() => this.router?.refresh())
        .catch(() => console.log("Something went wrong"));
    }
  }

  private unblockUser(targetUser: string) {
    this.outlet?.getElementsByClassName("UserComponentOnline")[0]!.classList.add("hidden");
    this.outlet?.getElementsByClassName("UserComponentOffline")[0]!.classList.remove("hidden"); // TODO: probably back will check this
    if (!this.userProfile?.relation.owner) {
      return;
    }
    const delFriendBtn = (this.outlet?.getElementsByClassName("UserComponentUnblockBtn")[0]! as HTMLButtonElement);
    delFriendBtn.classList.remove("hidden");
    delFriendBtn.onclick = async () => {
      this.RelationService.unblockUser(targetUser)
        .then(() => this.router?.refresh())
        .catch(() => console.log("Something went wrong"));
    }
  }

  private setRelationStatus() {
    switch (this.userProfile?.relation?.type) {
      case Relation.NO_RELATION:
        this.sendFriendRequest(this.userProfile.username);
        break;
      case Relation.FRIENDSHIP_ACCEPTED:
        this.removeFriend(this.userProfile.username);
        break;
      case Relation.FRIENDSHIP_REQUESTED:
        this.handleFriendRequest(this.userProfile.username);
        break;
      case Relation.BLOCKED:
        this.unblockUser(this.userProfile.username);
        break;

      default:
        break;
    }
  }

  private setOnlineStatus() {
    if (this.userProfile?.online)
      this.outlet?.getElementsByClassName("UserComponentOnline")[0]!.classList.remove("hidden");
    else
      this.outlet?.getElementsByClassName("UserComponentOffline")[0]!.classList.remove("hidden");
  }

  async destroy() {
      
  }
}
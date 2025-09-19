import { LoggedUser } from "../../auth/LoggedUser";
import AmethComponent from "../../framework/AmethComponent";
import { TitleHelper } from "../../framework/TitleHelper/TitleHelper";
import UserProfileService from "./services/UserProfileService";
import type UserProfile from "./models/UserProfile";
import UserStatsComponent from "./UserStatsComponent/UserStatsComponent";
import { AuthService } from "../../auth/services/AuthService";
import { Relation } from "./models/RelationInfo";
import RelationService from "./services/RelationService";

export default class UserComponent extends AmethComponent {
  template = () => import("./UserComponent.html?raw");
  protected userProfileService: UserProfileService;
  protected RelationService: RelationService;
  protected userProfile?: UserProfile;
  protected userName?: string;

  constructor() {
    super();
    this.userProfileService = new UserProfileService();
    this.RelationService = new RelationService();
  }

  async afterInit() {
    this.refresh();
  }

  async refresh() {
    this.clearView();
    const username = this.router?.currentPath.params["userId"] as string;
    this.userName = (await LoggedUser.get())?.username;
    if (!username)
      this.router?.redirectByPath("404")
    else if (username === this.userName)
      this.userProfile = (await LoggedUser.get(true))! as unknown as UserProfile;
    else {
      try {
        this.userProfile = await this.userProfileService.getUserProfile(username) as unknown as UserProfile;
      } catch (error) {
        this.router?.redirectByPath("404");
      }
    }
    if (this.userProfile) {
      this.updateTitle();
      this.fillView();
    }
    else
      this.router?.redirectByPath("404");
  }

  private clearView() {
    for (const action of [...(document.getElementById("userActions")?.getElementsByClassName("btn")!)]) {
      action.classList.add("hidden");
    }
    document.getElementById("UserComponentPendingRequest")?.classList.add("hidden");
    document.getElementById("UserComponentOnline")!.classList.add("hidden");
    document.getElementById("UserComponentOffline")!.classList.add("hidden");
  }

  private fillView() {
    (document.getElementById("userAvatar")! as HTMLImageElement).src = this.userProfile!.avatarUrl;
    document.getElementById("UserComponentUsername")!.innerText = this.userProfile!.username;
    document.getElementById("UserComponentCreationTime")!.innerText = new Date(this.userProfile!.creationTime).toDateString();
    if (this.userProfile?.username === this.userName) {
      const editBtn = (document.getElementById("UserComponentEditBtn")! as HTMLAnchorElement);
      editBtn.href = `/${this.userProfile!.username}/edit`;
      editBtn.classList.remove("hidden");
      const logOutBtn = document.getElementById("UserComponentLogout")!;
      logOutBtn.onclick = this.logOut.bind(this);
      logOutBtn.classList.remove("hidden");
    }
    else {
      this.setOnlineStatus();
      this.setRelationStatus();
    }
    this.initStatsComponent();
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
    const addFriendBtn = (document.getElementById("UserComponentAddFriendBtn")! as HTMLAnchorElement);
    addFriendBtn.classList.remove("hidden");
    addFriendBtn.onclick = async () => {
      this.RelationService.addFriend(targetUser)
        .then(() => this.router?.refresh())
        .catch(() => console.log("Something went wrong"));
    }
  }

  private removeFriend(targetUser: string) {
    this.blockUser(targetUser);
    const delFriendBtn = (document.getElementById("UserComponentDeleteFriendBtn")! as HTMLAnchorElement);
    delFriendBtn.classList.remove("hidden");
    delFriendBtn.onclick = async () => {
      this.RelationService.removeFriend(targetUser)
        .then(() => this.router?.refresh())
        .catch(() => console.log("Something went wrong"));
    }
  }

  private handleFriendRequest(targetUser: string) { // TODO: Probably this will never show here
    this.blockUser(targetUser);
    const pendingRequestEl = document.getElementById("UserComponentPendingRequest")!;
    if (!this.userProfile?.relation.owner) {
      document.getElementById("pendingReqText")!.innerHTML = `Waiting for acceptance...`;
      pendingRequestEl.classList.remove("hidden");
      return;
    }
    const acceptBtn = document.getElementById("UserComponentAcceptBtn")!;
    const declineBtn = document.getElementById("UserComponentDeclineBtn")!;
    document.getElementById("pendingReqText")!.innerHTML = `${targetUser}: Wants to be your friend!`;

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
    const blockBtn = (document.getElementById("UserComponentBlockBtn")! as HTMLAnchorElement);
    blockBtn.classList.remove("hidden");
    blockBtn.onclick = async () => {
      this.RelationService.blockUser(targetUser)
        .then(() => this.router?.refresh())
        .catch(() => console.log("Something went wrong"));
    }
  }

  private unblockUser(targetUser: string) {
    document.getElementById("UserComponentOnline")!.classList.add("hidden");
    document.getElementById("UserComponentOffline")!.classList.remove("hidden"); // TODO: probably back will check this
    if (this.userProfile?.relation.owner === true) { return; }
    const delFriendBtn = (document.getElementById("UserComponentUnBlockBtn")! as HTMLAnchorElement);
    delFriendBtn.classList.remove("hidden");
    delFriendBtn.onclick = async () => {
      this.RelationService.unblockUser(targetUser)
        .then(() => this.router?.refresh())
        .catch(() => console.log("Something went wrong"));
    }
  }

  private setRelationStatus() {
    switch (this.userProfile?.relation.type) {
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
      document.getElementById("UserComponentOnline")!.classList.remove("hidden");
    else
      document.getElementById("UserComponentOffline")!.classList.remove("hidden");
  }

  private async initStatsComponent() {
    const userStats = new UserStatsComponent();
    await userStats.init("UserComponentStats", this.router);
    userStats.afterInit();
  }

  private updateTitle() {
    if (this.userProfile?.username) {
      document.title = TitleHelper.addTitlePart(this.userProfile.username);
    }
  }
}

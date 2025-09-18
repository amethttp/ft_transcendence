import { LoggedUser } from "../../auth/LoggedUser";
import AmethComponent from "../../framework/AmethComponent";
import { TitleHelper } from "../../framework/TitleHelper/TitleHelper";
import UserProfileService from "./services/UserProfileService";
import type UserProfile from "./models/UserProfile";
import UserStatsComponent from "./UserStatsComponent/UserStatsComponent";
import { AuthService } from "../../auth/services/AuthService";
import { Relation } from "./models/RelationType";
import type RelationRequest from "./models/RelationRequest";

export default class UserComponent extends AmethComponent {
  template = () => import("./UserComponent.html?raw");
  protected userProfileService: UserProfileService;
  protected userProfile?: UserProfile;
  protected userName?: string;

  constructor() {
    super();
    this.userProfileService = new UserProfileService();
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

  private setRelationStatus() {
    let relationRequest: RelationRequest = {
      username: this.userProfile?.username ?? "",
      relation: Relation.NO_RELATION
    };

    switch (this.userProfile?.relation) {
      case Relation.FRIENDSHIP_ACCEPTED:
        const delFriendBtn = (document.getElementById("UserComponentDeleteFriendBtn")! as HTMLAnchorElement);
        delFriendBtn.classList.remove("hidden");
        delFriendBtn.onclick = async () => { // TODO: abstract this into a private func
          relationRequest.relation = Relation.FRIENDSHIP_ACCEPTED;
          this.userProfileService.removeFriend(relationRequest)
            .then(() => this.router?.refresh())
            .catch(() => console.log("Something went wrong"));
        }
        break;
      case Relation.FRIENDSHIP_REQUESTED:
        document.getElementById("username")!.innerHTML = this.userProfile?.username ?? "";
        const pendingRequestBtn = (document.getElementById("UserComponentPendingRequestBtn")! as HTMLAnchorElement); // TODO: 2 buttons accept/decline??
        pendingRequestBtn.classList.remove("hidden");
        pendingRequestBtn.onclick = async () => {
          relationRequest.relation = Relation.FRIENDSHIP_REQUESTED;
          this.userProfileService.addFriend(relationRequest)
            .then(() => this.router?.refresh())
            .catch(() => console.log("Something went wrong"));
        }
        break;
      case Relation.BLOCKED:
        document.getElementById("UserComponentOnline")!.classList.add("hidden");
        document.getElementById("UserComponentOffline")!.classList.remove("hidden"); // TODO: probably back will check this
        document.getElementById("UserComponentBlockedBtn")!.classList.remove("hidden");
        break;

      default:
        const addFriendBtn = (document.getElementById("UserComponentAddFriendBtn")! as HTMLAnchorElement);
        addFriendBtn.classList.remove("hidden");
        addFriendBtn.onclick = async () => {
          this.userProfileService.addFriend(relationRequest)
            .then(() => this.router?.refresh())
            .catch(() => console.log("Something went wrong"));
        }
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

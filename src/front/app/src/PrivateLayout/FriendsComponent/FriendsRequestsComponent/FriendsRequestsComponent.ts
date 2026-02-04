import Alert from "../../../framework/Alert/Alert";
import AmethComponent from "../../../framework/AmethComponent";
import { DOMHelper } from "../../../utils/DOMHelper";
import type UserProfile from "../../UserComponent/models/UserProfile";
import UserProfileActionsComponent from "../../UserComponent/UserProfileComponent/variants/UserProfileActionsComponent/UserProfileActionsComponent";
import { FriendsService } from "../services/FriendsService";

export default class FriendsRequestsComponent extends AmethComponent {
  template = () => import("./FriendsRequestsComponent.html?raw");
  private friendsService: FriendsService;
  private _container!: HTMLDivElement;
  private _profileComponents: UserProfileActionsComponent[] = [];

  constructor() {
    super();
    this.friendsService = new FriendsService();
  }

  afterInit() {
    this._container = this.outlet?.getElementsByClassName("friendsListContainer")[0]! as HTMLDivElement;
    this.refresh();
  }

  clearView() {
    this._profileComponents.forEach(p => p.destroy());
    this._profileComponents = [];
    this._container.innerHTML = "Still no requests :(";
  }

  async fillView(friends: UserProfile[]) {
    if (friends.length > 0)
      this._container.innerHTML = "";
    for (const friend of friends) {
      let template = `
      <a class="" href="/${friend.username}"></a>
    `;
      const elem = DOMHelper.createElementFromHTML(template);
      this._container.appendChild(elem);
      const profile = new UserProfileActionsComponent(friend);
      await profile.init(elem.id, this.router);
      profile.on("change", () => this.router?.refresh());
      profile.afterInit();
      this._profileComponents.push(profile);
    }
  }

  async refresh() {
    this.clearView();
    this.friendsService.getRequests().then(val => {
      this.fillView(val);
    }).catch(() => Alert.error("Some error occurred: ", "Could not retrieve your friendship requests"));
  }

  async destroy(): Promise<void> {
    this._profileComponents.forEach(p => p.destroy());
    this._profileComponents = [];
    await super.destroy();
  }
}

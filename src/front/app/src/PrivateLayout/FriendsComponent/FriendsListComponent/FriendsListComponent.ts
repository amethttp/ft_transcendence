import AmethComponent from "../../../framework/AmethComponent";
import { Context } from "../../../framework/Context/Context";
import { DOMHelper } from "../../../utils/DOMHelper";
import type UserProfile from "../../UserComponent/models/UserProfile";
import UserProfileActionsComponent from "../../UserComponent/UserProfileComponent/variants/UserProfileActionsComponent/UserProfileActionsComponent";

export default class FriendsListComponent extends AmethComponent {
  template = () => import("./FriendsListComponent.html?raw");
  protected _container!: HTMLDivElement;

  constructor() {
    super();
  }

  async afterInit() {
    this._container = this.outlet?.getElementsByClassName("friendsListContainer")[0]! as HTMLDivElement;
    Context.friends.on("profile", this.fillView);
  }

  clearView() {
    this._container.innerHTML = "Still no friends :(";
  }

  // TODO: Store all components and destroy them!
  fillView = async (friends: UserProfile[]) => {
    console.count("Friends");
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
    }
  }

  async refresh() {
    this.clearView();
  }

  async destroy() {
    Context.friends.off("profile", this.fillView);
  }
}

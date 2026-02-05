import { Context } from "../../../../../framework/Context/Context";
import { DOMHelper } from "../../../../../utils/DOMHelper";
import type UserProfile from "../../../../UserComponent/models/UserProfile";
import UserProfileSidebarComponent from "../../../../UserComponent/UserProfileComponent/variants/UserProfileSidebarComponent/UserProfileSidebarComponent";
import FriendsListComponent from "../../FriendsListComponent";

export default class FriendsListSidebarComponent extends FriendsListComponent<UserProfileSidebarComponent> {
  template = () => import("./FriendsListSidebarComponent.html?raw");

  clearView() {
    if (this._container)
      this._container.innerHTML = "";
  }

  async afterInit() {
    super.afterInit();
    Context.friends.get(true);
  }

  async createProfile(friend: UserProfile): Promise<UserProfileSidebarComponent> {
    let template = `
      <div class="flex w-full"></div>
    `;
    const elem = DOMHelper.createElementFromHTML(template);
    if (this._container)
      this._container.appendChild(elem);
    const profile = new UserProfileSidebarComponent(friend);
    await profile.init(elem.id, this.router);
    profile.on("change", () => this.router?.refresh());
    profile.afterInit();
    return profile;
  }

  async refresh() {
    await super.refresh();
    await Context.friends.get(true);
  }
}

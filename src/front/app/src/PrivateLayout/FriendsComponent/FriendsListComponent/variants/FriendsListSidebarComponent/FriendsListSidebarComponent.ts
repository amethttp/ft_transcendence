import { Context } from "../../../../../framework/Context/Context";
import { DOMHelper } from "../../../../../utils/DOMHelper";
import type UserProfile from "../../../../UserComponent/models/UserProfile";
import UserProfileSidebarComponent from "../../../../UserComponent/UserProfileComponent/variants/UserProfileSidebarComponent/UserProfileSidebarComponent";
import FriendsListComponent from "../../FriendsListComponent";

export default class FriendsListSidebarComponent extends FriendsListComponent {
  template = () => import("./FriendsListSidebarComponent.html?raw");

  clearView() {
    this._container.innerHTML = "";
  }

  async afterInit() {
    super.afterInit();
    Context.friends.get(true);
  }
  fillView = async (friends: UserProfile[]) => {
    this._container.innerHTML = "";
    for (const friend of friends) {
      let template = `
        <div class="flex w-full"></div>
      `;
      const elem = DOMHelper.createElementFromHTML(template);
      this._container.appendChild(elem);
      const profile = new UserProfileSidebarComponent(friend);
      await profile.init(elem.id);
      profile.afterInit();
    }
  }

  async refresh() {
    await super.refresh();
    await Context.friends.get(true);
  }
}

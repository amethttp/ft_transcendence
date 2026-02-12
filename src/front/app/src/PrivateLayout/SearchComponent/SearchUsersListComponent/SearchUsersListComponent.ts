
import FriendsListComponent from "../../FriendsComponent/FriendsListComponent/FriendsListComponent";
import type UserProfile from "../../UserComponent/models/UserProfile";
import UserProfileActionsComponent from "../../UserComponent/UserProfileComponent/variants/UserProfileActionsComponent/UserProfileActionsComponent";

export default class SearchUsersListComponent extends FriendsListComponent {
  template = () => import("./SearchUsersListComponent.html?raw")

  protected listenData() { }

  clearView() {
    if (this._container)
      this._container.innerHTML = "";
  }

  protected stopListenData() { }

  async createProfile(friend: UserProfile): Promise<UserProfileActionsComponent> {
    const profile = await super.createProfile(friend);
    profile.hideActions();
    return profile;
  }
}

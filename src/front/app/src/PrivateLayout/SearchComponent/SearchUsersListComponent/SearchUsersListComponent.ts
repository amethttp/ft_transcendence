
import FriendsListComponent from "../../FriendsComponent/FriendsListComponent/FriendsListComponent";

export default class SearchUsersListComponent extends FriendsListComponent {
  template = () => import("./SearchUsersListComponent.html?raw")

  protected listenData() { }

  clearView() {
    this._container.innerHTML = "";
  }

  protected stopListenData() { }
}

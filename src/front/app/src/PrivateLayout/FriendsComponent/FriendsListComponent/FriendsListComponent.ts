import { LoggedUser } from "../../../auth/LoggedUser";
import AmethComponent from "../../../framework/AmethComponent";

export default class FriendsListComponent extends AmethComponent {
  template = () => import("./FriendsListComponent.html?raw");

  constructor() {
    super();
  }

  afterInit() {
    this.refresh();
  }

  async refresh() {
    document.getElementById("userGame")!.innerText = (await LoggedUser.get())?.id?.toString() || "NONE";
  }
}

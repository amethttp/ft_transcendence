import { LoggedUser } from "../../../auth/LoggedUser";
import AmethComponent from "../../../framework/AmethComponent";

export default class UserComponent extends AmethComponent {
  template = () => import("./UserStatsComponent.html?raw");

  constructor() {
    super();
  }

  async afterInit() {
    document.getElementById("userIdw")!.innerHTML =
      (await LoggedUser.get())?.id?.toString() || "None";
  }

  refresh() {
    this.afterInit();
  }
}

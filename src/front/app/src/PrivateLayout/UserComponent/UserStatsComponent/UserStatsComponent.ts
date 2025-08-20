import AmethComponent from "../../../framework/AmethComponent";

export default class UserComponent extends AmethComponent {
  template = () => import("./UserStatsComponent.html?raw");

  constructor() {
    super();
  }

  afterInit() {
    document.getElementById("userIdw")!.innerHTML =
      this.router?.currentPath.params["userId"] as string;
  }

  refresh() {
    this.afterInit();
  }
}

import AmethComponent from "../../../framework/AmethComponent";

export default class UserProfileComponent extends AmethComponent {
  template = () => import("./UserProfileComponent.html?raw");

  constructor() {
    super();
  }

  afterInit() {
    document.getElementById("userProfile")!.innerHTML =
      this.router?.currentPath.params["userId"] as string;
  }
}

import AmethComponent from "../../../framework/AmethComponent";

export default class UserEditComponent extends AmethComponent {
  template = () => import("./UserEditComponent.html?raw");

  constructor() {
    super();
    // this.userProfileService = new UserProfileService();
  }

  afterInit() {
    // const username = this.router?.currentPath.params["userId"] as string;
    // this.userProfileService.getUserProfile(username).then(val => {
    //   this.userProfile = val;
    //   this.fillView();
    // });
  }

  fillView() {
    // document.getElementById("userProfile")!.innerHTML = this.userProfile?.email || "NONE";
  }

}

import type UserProfile from "../../PrivateLayout/UserComponent/UserProfileComponent/models/UserProfile";
import { LoggedUser } from "../../auth/LoggedUser";
import AmethComponent from "../../framework/AmethComponent";


export default class AccessLayout extends AmethComponent {
  template = () => import("./AccessLayout.html?raw");
  afterInit() {
    this.refresh();
  }

  async refresh() {
    const loggedUser: UserProfile | null = await LoggedUser.get();
    if (loggedUser !== null)
      this.router?.redirectByPath('/home');
  }
}

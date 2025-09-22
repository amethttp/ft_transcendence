import AmethComponent from "../framework/AmethComponent";
import { Context } from "../framework/Context/Context";
import { UserFriends } from "./FriendsComponent/UserFriends/UserFriends";
import SidebarComponent from "./SidebarComponent/SidebarComponent";

export default class PrivateLayout extends AmethComponent {
  template = () => import("./PrivateLayout.html?raw");
  private _sidebar!: SidebarComponent;

  constructor() {
    super();
    Context.friends = new UserFriends();
  }

  async afterInit() {
    this._sidebar = new SidebarComponent();
    await this._sidebar.init("sidebar", this.router);
    this._sidebar.afterInit();
  }

  refresh(): void {
      this._sidebar.refresh();
  }
}

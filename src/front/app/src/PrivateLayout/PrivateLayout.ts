import AmethComponent from "../framework/AmethComponent";
import { Context } from "../framework/Context/Context";
import { UserFriends } from "./FriendsComponent/UserFriends/UserFriends";
import SidebarComponent from "./SidebarComponent/SidebarComponent";
import { StatusService } from "./services/StatusService";

export default class PrivateLayout extends AmethComponent {
  template = () => import("./PrivateLayout.html?raw");
  private _statusService: StatusService;
  private _sidebar!: SidebarComponent;

  constructor() {
    super();
    Context.friends = new UserFriends();
    this._statusService = new StatusService();
    this._startStatusPolling();
  }

  private _startStatusPolling() {
    this._statusService.refreshStatus();
    this.setInterval(() => {
      this._statusService.refreshStatus();
    }, 20000);
  }

  async afterInit() {
    this._sidebar = new SidebarComponent();
    await this._sidebar.init("sidebar", this.router);
    this._sidebar.afterInit();
  }

  refresh(): void {
    this._sidebar.refresh();
  }

  async destroy() {
    Context.friends.destroy();
    await this._sidebar.destroy();
    await super.destroy();
  }
}

import AmethComponent from "../framework/AmethComponent";
import { Context } from "../framework/Context/Context";
import { UserFriends } from "./FriendsComponent/UserFriends/UserFriends";
import SidebarComponent from "./SidebarComponent/SidebarComponent";
import { StatusService } from "./services/StatusService";

export default class PrivateLayout extends AmethComponent {
  template = () => import("./PrivateLayout.html?raw");
  private _sidebar!: SidebarComponent;
  private _statusIntervalId?: number;
  private _statusService: StatusService;

  constructor() {
    super();
    Context.friends = new UserFriends();
    this._statusService = new StatusService();
    this._startStatusPooling();
  }

  private _startStatusPooling() {
    this._statusService.refreshStatus();
    this._statusIntervalId = setInterval(() => {
      this._statusService.refreshStatus();
    }, 20000)
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
    super.destroy();
    clearInterval(this._statusIntervalId);
  }
}

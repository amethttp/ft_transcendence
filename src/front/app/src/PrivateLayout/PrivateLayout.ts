import AmethComponent from "../framework/AmethComponent";
import { Context } from "../framework/Context/Context";
import ContextBarComponent from "./ContextBarComponent/ContextBarComponent";
import { UserFriends } from "./FriendsComponent/UserFriends/UserFriends";
import SidebarComponent from "./SidebarComponent/SidebarComponent";
import { StatusService } from "./services/StatusService";

export default class PrivateLayout extends AmethComponent {
  template = () => import("./PrivateLayout.html?raw");
  private _statusIntervalId?: number;
  private _statusService: StatusService;
  private _sidebar!: SidebarComponent;
  private _contextBar!: ContextBarComponent;

  constructor() {
    super();
    Context.friends = new UserFriends();
    this._statusService = new StatusService();
    this._startStatusPooling();
  }

  private _startStatusPooling() {
    this._statusService.refreshStatus();
    this._statusIntervalId = this.setInterval(() => {
      this._statusService.refreshStatus();
    }, 20000)
  }

  async afterInit() {
    this._sidebar = new SidebarComponent();
    await this._sidebar.init("sidebar", this.router);
    this._sidebar.afterInit();
    this._contextBar = new ContextBarComponent();
    await this._contextBar.init("PrivateLayoutContextBarComponent", this.router);
    this._contextBar.afterInit();
  }

  refresh(): void {
    this._sidebar.refresh();
    this._contextBar.refresh();
  }

  async destroy() {
    Context.friends.destroy();
    await this._sidebar.destroy();
    await this._contextBar.destroy();
    await super.destroy();
  }
}

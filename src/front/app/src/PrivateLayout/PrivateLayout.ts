import { ApiClient } from "../ApiClient/ApiClient";
import AmethComponent from "../framework/AmethComponent";
import type { IHttpClient } from "../framework/HttpClient/IHttpClient";
import SidebarComponent from "./SidebarComponent/SidebarComponent";

export default class PrivateLayout extends AmethComponent {
  template = () => import("./PrivateLayout.html?raw");
  private _sidebar!: SidebarComponent;
  private _statusIntervalId?: number;
  private _apiClient: IHttpClient;

  constructor() {
    super();

    this._apiClient = new ApiClient();
    this._startStatusPooling();
  }

  private _startStatusPooling() {
    this._refreshStatus();
    this._statusIntervalId = setInterval(() => {
      this._refreshStatus();
    }, 20000)
  }

  private _refreshStatus() {
    this._apiClient.post('/status/refresh')
      .catch(err => console.warn(err));
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

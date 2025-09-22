import { ApiClient } from "../ApiClient/ApiClient";
import AmethComponent from "../framework/AmethComponent";
import type { IHttpClient } from "../framework/HttpClient/IHttpClient";
import SidebarComponent from "./SidebarComponent/SidebarComponent";

export default class PrivateLayout extends AmethComponent {
  template = () => import("./PrivateLayout.html?raw");
  private _sidebar!: SidebarComponent;
  private _intervalId?: number;
  private _apiClient: IHttpClient;

  constructor() {
    super();

    this._apiClient = new ApiClient();
    this._intervalId = setInterval(() => {
      this._apiClient.post('/status/refresh', '{}')
        .then(() => {})
        .catch(err => console.error(err));
    }, 20000)
  }

  async destroy() {
    super.destroy();
    clearInterval(this._intervalId);
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

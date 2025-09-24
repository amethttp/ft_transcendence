import { ApiClient } from "../../ApiClient/ApiClient";
import AmethComponent from "../../framework/AmethComponent";

export default class DownloadDataComponent extends AmethComponent {
  template = () => import("./DownloadDataComponent.html?raw");

  afterInit() {
    this.refresh();
  }

  refresh(): void {
    const a = document.getElementById("DownloadDataComponentLink")! as HTMLAnchorElement;
    a.href = ApiClient.BASE_URL + "/user/download/" + this.router?.currentPath.params["token"];
    a.click();
  }
}

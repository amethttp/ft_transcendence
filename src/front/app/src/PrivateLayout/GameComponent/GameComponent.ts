import { LoggedUser } from "../../auth/LoggedUser";
import AmethComponent from "../../framework/AmethComponent";
import Sidebar from "../components/SidebarComponent/SidebarComponent";

export default class GameComponent extends AmethComponent {
  template = () => import("./GameComponent.html?raw");
  protected sidebar: Sidebar;

  constructor() {
    super();
    this.sidebar = new Sidebar();
  }

  afterInit() {
    this.sidebar.init("user-sidebar");
    this.refresh();
  }

  async refresh() {
    document.getElementById("userGame")!.innerText = (await LoggedUser.get())?.id?.toString() || "NONE";
  }
}

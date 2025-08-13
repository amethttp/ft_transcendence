import { AmethComponent } from "../../framework/AmethComponent";
import Sidebar from "../../layouts/dashboard/sidebar/sidebar";

export default class UserComponent extends AmethComponent {
  template = () => import('./user.html?raw');
  protected sidebar: Sidebar;

  constructor() {
    super();
    this.sidebar = new Sidebar();
  }

  afterInit() {
    this.sidebar.init("user-sidebar");
    document.getElementById("userId")!.innerHTML = this.router?.currentPath.params.get("userId") as string;
  }
}
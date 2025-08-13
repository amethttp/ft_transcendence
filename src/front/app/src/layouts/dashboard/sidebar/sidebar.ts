import { AmethComponent } from "../../../framework/AmethComponent";

class Sidebar extends AmethComponent {
  template = () => import("./sidebar.html?raw");

  afterInit() {
  }
}

export default Sidebar;

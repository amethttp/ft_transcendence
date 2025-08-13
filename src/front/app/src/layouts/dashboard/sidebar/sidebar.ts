import { AmethComponent } from "../../../framework/AmethComponent";

class Sidebar extends AmethComponent {
  template = () => import("./sidebar.html?raw");

  afterInit() {
    console.log("SIDEBAR LOADED!");
  };
}

export default Sidebar;
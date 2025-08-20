import AmethComponent from "../../../framework/AmethComponent";

export default class SidebarComponent extends AmethComponent {
  template = () => import("./SidebarComponent.html?raw");

  afterInit() {}
}

import AmethComponent from "../../framework/AmethComponent";

export default class NavbarComponent extends AmethComponent {
  template = () => import("./NavbarComponent.html?raw");
  afterInit() {}
}

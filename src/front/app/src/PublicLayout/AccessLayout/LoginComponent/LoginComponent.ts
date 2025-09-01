import AmethComponent from "../../../framework/AmethComponent";

export default class LoginComponent extends AmethComponent {
  template = () => import("./LoginComponent.html?raw");
  afterInit() {}
}

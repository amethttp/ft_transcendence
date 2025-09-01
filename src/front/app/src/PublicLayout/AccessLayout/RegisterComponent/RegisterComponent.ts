import AmethComponent from "../../../framework/AmethComponent";

export default class RegisterComponent extends AmethComponent {
  template = () => import("./RegisterComponent.html?raw");
  afterInit() {}
}

import AmethComponent from "../../framework/AmethComponent";

export default class FooterComponent extends AmethComponent {
  template = () => import("./FooterComponent.html?raw");
  afterInit() {}
}

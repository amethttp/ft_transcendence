import AmethComponent from "../../framework/AmethComponent";

export default class LandingComponent extends AmethComponent {
  template = () => import("./LandingComponent.html?raw");
  afterInit() {}
}

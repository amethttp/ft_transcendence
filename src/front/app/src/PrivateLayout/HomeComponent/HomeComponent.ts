import AmethComponent from "../../framework/AmethComponent";

export default class HomeComponent extends AmethComponent {
  template = () => import("./HomeComponent.html?raw")

  constructor() {
    super();
  }

  async afterInit() {
    await this.refresh();
  }

  async refresh() {

  }
}

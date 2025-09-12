import AmethComponent from "../../framework/AmethComponent";


export default class BaseAccessLayout extends AmethComponent {
  template = () => import("./BaseAccessLayout.html?raw");

  afterInit() {
  }

  async refresh() {
  }
}

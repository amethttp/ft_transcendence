import AmethComponent from "../framework/AmethComponent";

export default class PublicLayout extends AmethComponent {
  template = () => import("./PublicLayout.html?raw");
}

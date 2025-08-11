import type { AmethComponent } from "../../framework/AmethComponent";

export default class App implements AmethComponent {
  template = () => import("./landing.html?raw");
  init() {
    console.log("Entro init Landing!!!");
  }
  viewInit() {
    console.log("Entro viewInit Landing!!!");
  }
}

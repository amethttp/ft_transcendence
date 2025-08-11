import type { AmethComponent } from "../../framework/AmethComponent";

export default class User implements AmethComponent {
  template = () => import("./user.html?raw");
  init() {
    console.log("Entro init User!!!");
  }
  viewInit() {
    console.log("Entro viewInit User!!!");
  }
}

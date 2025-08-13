import type { AmethComponent } from "../../framework/AmethComponent";

class LandingComponent implements AmethComponent {
  template = () => import("./landing.html?raw");
  init() {
    console.log("Entro init Landing!!!");
  }
  viewInit() {
    console.log("Entro viewInit Landing!!!");
  }
}

export default LandingComponent;

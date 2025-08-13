import { AmethComponent } from "../../framework/AmethComponent";

class LandingComponent extends AmethComponent {
  template = () => import("./landing.html?raw");
  afterInit() {
  }
}

export default LandingComponent;

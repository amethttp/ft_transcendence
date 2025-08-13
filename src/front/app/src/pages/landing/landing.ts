import { AmethComponent } from "../../framework/AmethComponent";

class LandingComponent extends AmethComponent {
  template = () => import("./landing.html?raw");
  afterInit() {
    console.log("Entro viewInit Landing!!!");
  }
}

export default LandingComponent;

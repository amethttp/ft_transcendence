import AmethComponent from "../framework/AmethComponent";
import FooterComponent from "./FooterComponent/FooterComponent";
import NavbarComponent from "./NavbarComponent/NavbarComponent";

export default class PublicLayout extends AmethComponent {
  template = () => import("./PublicLayout.html?raw");

  constructor() {
    super();
  }

  afterInit() {
    const navbar = new NavbarComponent();
    navbar.init("navbar");
    const footer = new FooterComponent();
    footer.init("footer");
  }
}

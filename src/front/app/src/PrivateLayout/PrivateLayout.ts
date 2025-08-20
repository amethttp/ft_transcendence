import AmethComponent from "../framework/AmethComponent";

export default class PrivateLayout extends AmethComponent {
  constructor() {
    super();
    this.template = () => import("./PrivateLayout.html?raw");
  }

  afterInit(): void {
    document.getElementById("logoutButton")!.onclick = () => {
      sessionStorage.setItem("logged", "0");
    };
  }
}

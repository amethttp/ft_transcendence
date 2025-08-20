import AmethComponent from "../framework/AmethComponent";

export default class PrivateLayout extends AmethComponent {
  constructor() {
    super();
    this.template = () => import("./PrivateLayout.html?raw");
  }

  afterInit(): void {
    console.log("PrivateLayout afterInit()");
    document.getElementById("logoutButton")!.onclick = () => {
      sessionStorage.setItem("logged", "0");
    };
  }
}

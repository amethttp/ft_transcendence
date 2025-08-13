import { AmethComponent } from "../framework/AmethComponent";

// import { Router } from "../../framework/Router";

export default class PrivateLayout extends AmethComponent {
  template = () => import("./PrivateLayout.html?raw");

  afterInit(): void {
    console.log("PrivateLayout afterInit()");
  }
  constructor() {
    super();
    // const router = new Router("dash-outlet", [
    //   // {
    //   //   path: "/",
    //   //   component: () => import("./pages/landing/landing"),
    //   // },
    // ]);
  }
}

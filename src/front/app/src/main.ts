import { Router } from "./framework/Router";

const router = new Router("app", [
  {
    path: "/",
    component: () => import("./pages/landing/landing"),
  },
  {
    path: "/landing",
    component: () => import("./pages/landing/landing"),
  },
  {
    path: "/user",
    component: () => import("./pages/user/user"),
  },
]);

router.listen();

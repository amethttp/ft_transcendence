import { Router } from "./framework/Router.ts";

const router = new Router("app", [
  {
    path: "/",
    component: () => import("./pages/landing/landing.ts"),
  },
  {
    path: "/landing",
    component: () => import("./pages/landing/landing.ts"),
  },
  {
    path: "/user",
    component: () => import("./pages/user/user.ts"),
  },
]);

router.listen();

import { Router, type Route } from "./framework/Router/Router";

const routes: Route[] = [
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
  {
    path: "/user/:userId",
    component: () => import("./pages/user/user"),
  },
];

new Router("app", routes);
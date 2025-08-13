import authGuard from "./authGuard/authGuard";
import type { Route } from "./framework/Router/Route/Route";
import { Router } from "./framework/Router/Router";

const routes: Route[] = [
  {
    path: "/",
    component: () => import("./pages/landing/landing"),
    guard: authGuard,
  },
  {
    path: "/",
    component: () => import("./pages/user/user"),
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

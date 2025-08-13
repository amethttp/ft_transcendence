import authGuard from "./utils/auth/authGuard/authGuard";
import type { Route } from "./framework/Router/Route/Route";
import { Router } from "./framework/Router/Router";

const routes: Route[] = [
  {
    path: "/",
    component: () => import("./PrivateLayout/UserComponent/UserComponent"),
    guard: authGuard,
  },
  {
    path: "/",
    component: () => import("./PublicLayout/LandingComponent/LandingComponent"),
  },
  {
    path: "/404",
    component: () => import("./PublicLayout/NotFound/NotFound"),
  },
  {
    path: "*",
    redirect: "/404",
  },
];

new Router("app", routes);

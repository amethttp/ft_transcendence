import type { Route } from "./framework/Router/Route/Route";
import { Router } from "./framework/Router/Router";
import { TitleHelper } from "./framework/TitleHelper/TitleHelper";
import loggedGuard from "./auth/guards/loggedGuard";

export const routes: Route[] = [
  {
    path: "",
    component: () => import("./PublicLayout/PublicLayout"),
    title: import.meta.env.VITE_APP_TITLE,
    children: [
      {
        path: "/",
        component: () => import("./PublicLayout/LandingComponent/LandingComponent"),
        title: "Arcade pong easy and fun to play"
      },
      {
        path: "",
        component: () => import("./PublicLayout/AccessLayout/AccessLayout"),
        children: [
          {
            path: "/login",
            component: () => import("./PublicLayout/AccessLayout/LoginComponent/LoginComponent"),
            title: "Login",
          },
          {
            path: "/register",
            component: () => import("./PublicLayout/AccessLayout/RegisterComponent/RegisterComponent"),
            title: "Register",
          },
        ]
      },
      {
        path: "404",
        component: () => import("./PublicLayout/NotFound/NotFound"),
        title: "Not found"
      },
    ],
  },
  {
    path: "",
    component: () => import("./PrivateLayout/PrivateLayout"),
    guard: loggedGuard,
    title: import.meta.env.VITE_APP_TITLE,
    children: [
      {
        path: "/home",
        component: () => import("./PrivateLayout/GameComponent/GameComponent"),
        title: "Games"
      },
      {
        path: "profile",
        component: () => import("./PrivateLayout/UserComponent/UserComponent"),
      },
      {
        path: ":userId",
        component: () => import("./PrivateLayout/UserComponent/UserComponent"),
        children: [
          {
            path: "",
            component: () => import("./PrivateLayout/UserComponent/UserProfileComponent/UserProfileComponent")
          },
          {
            path: "stats",
            component: () => import("./PrivateLayout/UserComponent/UserStatsComponent/UserStatsComponent"),
            title: "Stats"
          }
        ]
      },
      {
        path: "*",
        redirect: "/404",
      },
    ],
  },
];

const router = new Router("app", routes);

router.on("navigate", (e) => { TitleHelper.setTitleFromRouteTree(e.routeTree) });

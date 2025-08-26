import type { Route } from "./framework/Router/Route/Route";
import { Router } from "./framework/Router/Router";
import { TitleHelper } from "./framework/TitleHelper/TitleHelper";
import loggedGuard from "./auth/guards/loggedGuard";

export const routes: Route[] = [
  {
    path: "",
    component: () => import("./PrivateLayout/PrivateLayout"),
    guard: loggedGuard,
    title: import.meta.env.VITE_APP_TITLE,
    children: [
      {
        path: "/",
        component: () => import("./PrivateLayout/GameComponent/GameComponent"),
        title: "Games"
      },
      {
        path: "user",
        component: () => import("./PrivateLayout/UserComponent/UserComponent"),
      },
      {
        path: "user/:userId",
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
    ],
  },
  {
    path: "",
    component: () => import("./PublicLayout/PublicLayout"),
    title: import.meta.env.VITE_APP_TITLE,
    children: [
      {
        path: "/",
        component: () => import("./PublicLayout/LandingComponent/LandingComponent"),
        title: "Play our beautiful game"
      },
      {
        path: "landing",
        component: () => import("./PublicLayout/LandingComponent/LandingComponent"),
        title: "Play our beautiful game"
      },
    ],
  },
  {
    path: "*",
    redirect: "/",
  },
];

const router = new Router("app", routes);

router.emitter.on("navigate", async (e) => {TitleHelper.setTitleFromRouteTree(e.routeTree)});

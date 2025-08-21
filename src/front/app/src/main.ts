import type { Route } from "./framework/Router/Route/Route";
import authGuard from "./auth/authGuard/authGuard";
import { Router } from "./framework/Router/Router";

export const routes: Route[] = [
  {
    path: "",
    component: () => import("./PrivateLayout/PrivateLayout"),
    guard: authGuard,
    title: "AmethPong",
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
    title: "Play our beautiful game | AmethPong",
    children: [
      {
        path: "/",
        component: () => import("./PublicLayout/LandingComponent/LandingComponent"),
      },
      {
        path: "landing",
        component: () => import("./PublicLayout/LandingComponent/LandingComponent"),
      },
      {
        path: "*",
        component: () => import("./PublicLayout/NotFound/NotFound"),
      },
    ],
  },
];

const router = new Router("app", routes);

router.emitter.on("navigate", (e) => {
  let title = "";
  for (const route of e.routeTree) {
    if (route.title)
      title = route.title + (title ? " | " + title : "");
  }
  document.title = title;
})

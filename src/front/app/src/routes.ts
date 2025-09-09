import loggedGuard from "./auth/guards/loggedGuard";
import type { Route } from "./framework/Router/Route/Route";

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
        component: () => import("./PublicLayout/BaseAccessLayout/BaseAccessLayout"),
        children: [
          {
            path: "",
            component: () => import("./PublicLayout/BaseAccessLayout/AccessLayout/AccessLayout"),
            children: [
              {
                path: "/login",
                component: () => import("./PublicLayout/BaseAccessLayout/AccessLayout/LoginComponent/LoginComponent"),
                title: "Login",
              },
              {
                path: "/register",
                component: () => import("./PublicLayout/BaseAccessLayout/AccessLayout/RegisterComponent/RegisterComponent"),
                title: "Register",
              },
            ]
          },
          {
            path: "/verify",
            component: () => import("./PublicLayout/BaseAccessLayout/VerifyComponent/VerifyComponent"),
            title: "Two Factor Authentication",
          },
          {
            path: "/recover",
            component: () => import("./PublicLayout/BaseAccessLayout/RecoverPasswordComponent/RecoverPasswordComponent"),
            title: "Recover password",
          },
          {
            path: "/recover/:token",
            component: () => import("./PublicLayout/BaseAccessLayout/CreatePasswordComponent/CreatePasswordComponent"),
            title: "Create new password",
          }
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
    ],
  },
  {
    path: "*",
    redirect: "/404",
  },
];
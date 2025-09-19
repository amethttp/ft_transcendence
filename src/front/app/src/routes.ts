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
        component: () => import("./PrivateLayout/HomeComponent/HomeComponent"),
        title: "Home"
      },
      {
        path: "/play",
        component: () => import("./PrivateLayout/GameComponent/GameComponent"),
        title: "Play"
      },
      {
        path: "/game",
        component: () => import("./PrivateLayout/GameComponent/GameComponent"),
        title: "Join a game"
      },
      {
        path: "/tournament",
        component: () => import("./PrivateLayout/GameComponent/GameComponent"),
        title: "Join a tournament"
      },
      {
        path: "/friends",
        component: () => import("./PrivateLayout/FriendsComponent/FriendsComponent"),
        title: "My friends",
        children: [
          {
            path: "",
            component: () => import("./PrivateLayout/FriendsComponent/FriendsListComponent/FriendsListComponent")
          },
          {
            path: "/requests",
            component: () => import("./PrivateLayout/FriendsComponent/FriendsRequestsComponent/FriendsRequestsComponent"),
            title: "Requests"
          }
        ]
      },
      {
        path: "/:userId",
        component: () => import("./PrivateLayout/UserComponent/UserComponent"),
      },
      {
        path: "/:userId/edit",
        component: () => import("./PrivateLayout/UserComponent/UserEditComponent/UserEditComponent"),
      },
    ],
  },
  {
    path: "*",
    redirect: "/404",
  },
];
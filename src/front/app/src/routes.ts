import loggedResolver from "./auth/resolver/loggedResolver";
import type { Route } from "./framework/Router/Route/Route";
import matchResolver from "./PrivateLayout/PlayComponent/MatchComponent/resolvers/matchResolver";
import tournamentResolver from "./PrivateLayout/PlayComponent/TournamentComponent/resolvers/tournamentResolver";
import userEditResolver from "./PrivateLayout/UserComponent/UserEditComponent/resolver/userEditResolver";
import accessResolver from "./PublicLayout/BaseAccessLayout/AccessLayout/resolver/accessResolver";
import verifyResolver from "./PublicLayout/BaseAccessLayout/VerifyComponent/resolver/verifyResolver";

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
        path: "/user/download/:token",
        component: () => import("./PublicLayout/DownloadDataComponent/DownloadDataComponent"),
        title: "Download your data"
      },
      {
        path: "",
        component: () => import("./PublicLayout/BaseAccessLayout/BaseAccessLayout"),
        children: [
          {
            path: "/verify",
            component: () => import("./PublicLayout/BaseAccessLayout/VerifyComponent/VerifyComponent"),
            resolver: verifyResolver,
            title: "Two Factor Authentication",
          },
          {
            path: "/recover",
            component: () => import("./PublicLayout/BaseAccessLayout/RecoverPasswordComponent/RecoverPasswordComponent"),
            resolver: accessResolver,
            title: "Recover password",
          },
          {
            path: "/recover/:token",
            component: () => import("./PublicLayout/BaseAccessLayout/CreatePasswordComponent/CreatePasswordComponent"),
            title: "Create new password",
          },
          {
            path: "",
            component: () => import("./PublicLayout/BaseAccessLayout/AccessLayout/AccessLayout"),
            resolver: accessResolver,
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
          }
        ]
      },
      {
        path: "/privacy",
        component: () => import("./PublicLayout/PrivacyPageComponent/PrivacyPageComponent"),
        title: "Privacy Policy"
      },
      {
        path: "404",
        component: () => import("./PublicLayout/NotFound/NotFound"),
        title: "Not found"
      },
    ],
  },
  {
    path: "/google/callback",
    component: () => import("./OAuthCallback/OAuthCallbackComponent"),
    title: "Signing in..."
  },
  {
    path: "",
    component: () => import("./PrivateLayout/PrivateLayout"),
    resolver: loggedResolver,
    title: import.meta.env.VITE_APP_TITLE,
    children: [
      {
        path: "/home",
        component: () => import("./PrivateLayout/HomeComponent/HomeComponent"),
        title: "Home"
      },
      {
        path: "/play",
        component: () => import("./PrivateLayout/PlayComponent/PlayComponent"),
        children: [
          {
            path: "",
            component: ()=> import("./PrivateLayout/PlayComponent/MatchesComponent/MatchesComponent"),
            title: "Matches"
          },
          {
            path: "/tournaments",
            component: ()=> import("./PrivateLayout/PlayComponent/TournamentsComponent/TournamentsComponent"),
            title: "Tournaments"
          },
        ]
      },
      {
        path: "/play/new",
        component: () => import("./PrivateLayout/PlayComponent/NewMatchComponent/NewMatchComponent"),
        title: "New match",
      },
      {
        path: "/play/tournament/new",
        component: () => import("./PrivateLayout/PlayComponent/NewTournamentComponent/NewTournamentComponent"),
        title: "New tournament",
      },
      {
        path: "/play/:token",
        component: () => import("./PrivateLayout/PlayComponent/MatchComponent/MatchComponent"),
        resolver: matchResolver,
        title: "Match",
      },
      {
        path: "/play/tournament/:token",
        component: () => import("./PrivateLayout/PlayComponent/TournamentComponent/TournamentComponent"),
        resolver: tournamentResolver,
        title: "Tournament",
      },
      {
        path: "/social",
        component: () => import("./PrivateLayout/FriendsComponent/FriendsComponent"),
        title: "Social",
        children: [
          {
            path: "",
            component: () => import("./PrivateLayout/FriendsComponent/FriendsListComponent/FriendsListComponent"),
            title: "Friends"
          },
          {
            path: "/requests",
            component: () => import("./PrivateLayout/FriendsComponent/FriendsRequestsComponent/FriendsRequestsComponent"),
            title: "Requests"
          },
          {
            path: "/blocked",
            component: () => import("./PrivateLayout/FriendsComponent/FriendsBlockedComponent/FriendsBlockedComponent"),
            title: "Blocked"
          }
        ]
      },
      {
        path: "/search",
        component: () => import("./PrivateLayout/SearchComponent/SearchComponent")
      },
      {
        path: "/search/:query",
        component: () => import("./PrivateLayout/SearchComponent/SearchComponent")
      },
      {
        path: "/:userId",
        component: () => import("./PrivateLayout/UserComponent/UserComponent"),
      },
      {
        path: "/:userId/edit",
        component: () => import("./PrivateLayout/UserComponent/UserEditComponent/UserEditComponent"),
        resolver: userEditResolver,
        title: "Edit profile"
      },
    ],
  },
  {
    path: "*",
    redirect: "/404",
  },
];

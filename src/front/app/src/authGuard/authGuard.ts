import type { Route } from "../framework/Router/Route/Route";

export default function authGuard(route: Route): boolean {
  console.log("AuthGuard", route);
  return false;
}

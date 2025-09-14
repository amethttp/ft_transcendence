import type User from "../models/User";
import type { Guard } from "../../framework/Router/Route/Guard";
import type { Route } from "../../framework/Router/Route/Route";
import type { Router } from "../../framework/Router/Router";
import { LoggedUser } from "../LoggedUser";

export const loggedGuard: Guard = async (_route: Route, router: Router): Promise<boolean> => {
  const loggedUser: User | null = await LoggedUser.get(true);
  if (loggedUser === null) {
    router.redirectByPath('/login');
    return false;
  }
  return true;
}
export default loggedGuard;
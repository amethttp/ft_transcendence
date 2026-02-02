import type User from "../models/User";
import type { GuardResult } from "../../framework/Router/Route/Guard";
import type { Route } from "../../framework/Router/Route/Route";
import type { Router } from "../../framework/Router/Router";
import { LoggedUser } from "../LoggedUser";

export const loggedGuard = async (_route: Route, _router: Router): Promise<GuardResult> => {
  const loggedUser: User | null = await LoggedUser.get(true);
  if (loggedUser === null) {
    return { redirect: '/login' };
  }
  return true;
}
export default loggedGuard;
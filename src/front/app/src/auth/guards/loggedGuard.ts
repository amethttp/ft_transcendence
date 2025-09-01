import type UserProfile from "../../PrivateLayout/UserComponent/UserProfileComponent/models/UserProfile";
import type { Guard } from "../../framework/Router/Route/Guard";
import type { Route } from "../../framework/Router/Route/Route";
import type { Router } from "../../framework/Router/Router";
import { LoggedUser } from "../LoggedUser";

export const loggedGuard: Guard = async (_route: Route, router: Router): Promise<boolean> => {
  const loggedUser: UserProfile | null = await LoggedUser.get();
  if (loggedUser === null) {
    router.redirectByPath('/login');
    return false;
  }
  return true;
}
export default loggedGuard;
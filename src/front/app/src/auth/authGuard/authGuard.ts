import type UserProfile from "../../PrivateLayout/UserComponent/UserProfileComponent/models/UserProfile";
import type { Guard } from "../../framework/Router/Route/Guard";
import { LoggedUser } from "../LoggedUser";

export const authGuard: Guard = async (): Promise<boolean> => {
  const loggedUser: UserProfile | null = await LoggedUser.get();
  return loggedUser != null;
}
export default authGuard;
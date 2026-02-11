import { LoggedUser } from "../../../../auth/LoggedUser";
import type User from "../../../../auth/models/User";
import type { Guard, GuardResult } from "../../../../framework/Router/Route/Guard";

export const accessGuard: Guard = async (): Promise<GuardResult> => {
  const loggedUser: User | null = await LoggedUser.get(true);
  if (loggedUser !== null && loggedUser.username)
    return { redirect: '/home' };
  else
    return true;
}
export default accessGuard;
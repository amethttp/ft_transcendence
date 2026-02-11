import type User from "../models/User";
import type { Guard, GuardResult } from "../../framework/Router/Route/Guard";
import { LoggedUser } from "../LoggedUser";
import type Path from "../../framework/Router/Path/Path";

export const loggedGuard: Guard = async (path: Path): Promise<GuardResult> => {
  const loggedUser: User | null = await LoggedUser.get(true);
  if (loggedUser === null) {
    return { redirect: '/login?redirect=' + encodeURIComponent(path.fullPath) };
  }
  return true;
}
export default loggedGuard;
import { LoggedUser } from "../../../../auth/LoggedUser";
import type User from "../../../../auth/models/User";
import type Path from "../../../../framework/Router/Path/Path";
import type { Guard, GuardResult } from "../../../../framework/Router/Route/Guard";

export const userEditGuard: Guard = async (path: Path): Promise<GuardResult> => {
  const loggedUser: User | null = await LoggedUser.get(true);
  if (loggedUser && path.params.userId === loggedUser.username) {
    return true;
  }
  return { redirect: `/${path.params.userId}` };
}
export default userEditGuard;
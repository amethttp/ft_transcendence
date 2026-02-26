import { LoggedUser } from "../../../../auth/LoggedUser";
import type User from "../../../../auth/models/User";
import type { Resolver } from "../../../../framework/Router/Route/Resolver";

export const accessResolver: Resolver = async (): Promise<boolean | string> => {
  const loggedUser: User | null = await LoggedUser.get(true);
  if (loggedUser !== null)
    return '/home';
  else
    return true;
}
export default accessResolver;
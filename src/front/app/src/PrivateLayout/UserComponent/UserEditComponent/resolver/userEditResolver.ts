import { LoggedUser } from "../../../../auth/LoggedUser";
import type User from "../../../../auth/models/User";
import type { Resolver } from "../../../../framework/Router/Route/Resolver";

export const userEditResolver: Resolver = async () => {
  const loggedUser: User | null = await LoggedUser.get(true);

  if (loggedUser) {
    return { user: loggedUser };
  }

  return '/login';
}
export default userEditResolver;

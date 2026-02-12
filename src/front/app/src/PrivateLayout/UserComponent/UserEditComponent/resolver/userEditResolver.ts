import { LoggedUser } from "../../../../auth/LoggedUser";
import type User from "../../../../auth/models/User";
import type { Resolver } from "../../../../framework/Router/Route/Resolver";
import type Path from "../../../../framework/Router/Path/Path";

export const userEditResolver: Resolver = async (path: Path, _parentData): Promise<boolean | string> => {
  const loggedUser: User | null = await LoggedUser.get();
  const userId = path.params['userId'];
  
  if (loggedUser && loggedUser.username === userId) {
    return true;
  }
  
  return `/${userId}`;
}
export default userEditResolver;
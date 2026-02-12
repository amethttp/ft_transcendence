import type { Resolver } from "../../framework/Router/Route/Resolver";
import { LoggedUser } from "../LoggedUser";
import type Path from "../../framework/Router/Path/Path";

export const loggedResolver: Resolver = async (path: Path) => {
  const loggedUser = await LoggedUser.get(true);
  if (loggedUser === null) {
    return '/login?redirect=' + encodeURIComponent(path.fullPath);
  }
  return true;
}
export default loggedResolver;
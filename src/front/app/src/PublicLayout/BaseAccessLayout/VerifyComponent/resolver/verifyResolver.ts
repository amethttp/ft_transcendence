import type { Resolver } from "../../../../framework/Router/Route/Resolver";

export const verifyResolver: Resolver = async (): Promise<boolean | string> => {
  const userId = sessionStorage.getItem("userId");
  if (userId && parseInt(userId))
    return true;
  else
    return '/login';
}
export default verifyResolver;
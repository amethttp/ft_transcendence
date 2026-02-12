import type { Resolver } from "../../../../framework/Router/Route/Resolver";

export const verifyResolver: Resolver = async () => {
  const userId = sessionStorage.getItem("userId");
  if (userId && parseInt(userId))
    return { userId: parseInt(userId) };
  else
    return '/login';
}
export default verifyResolver;